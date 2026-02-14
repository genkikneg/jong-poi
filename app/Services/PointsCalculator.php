<?php

namespace App\Services;

use App\Models\Session;
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;
use Illuminate\Support\Collection;

class PointsCalculator
{
    public function __construct(protected Session $session)
    {
    }

    /**
     * @param array<int, array{user_id:int, final_score:string|int|float, rank?:int|null}> $rawResults
     * @return array<int, array{
     *     user_id:int,
     *     final_score:string,
     *     rank:int,
     *     points:string,
     *     score_diff:string,
     *     score_diff_scaled:string,
     *     rank_bonus:string,
     * }>
     */
    public function calculate(array $rawResults): array
    {
        $results = collect($rawResults)
            ->map(fn ($result) => [
                'user_id' => (int) $result['user_id'],
                'final_score' => BigDecimal::of((string) $result['final_score'])->toScale(1, RoundingMode::DOWN),
                'rank' => $result['rank'] ?? null,
            ]);

        $results = $this->applyRanks($results);

        $base = BigDecimal::of((string) $this->session->rule_base);
        $k = BigDecimal::of((string) $this->session->rule_k);
        $rankBonus = collect($this->session->rule_rank_bonus ?? []);

        return $results
            ->map(function ($result) use ($base, $k, $rankBonus) {
                $scoreDiff = $result['final_score']->minus($base)->toScale(1, RoundingMode::DOWN);
                $scaled = $scoreDiff->multipliedBy($k)->toScale(4, RoundingMode::DOWN);
                $bonusValue = $rankBonus->get((string) $result['rank'], 0);
                $bonus = BigDecimal::of((string) $bonusValue)->toScale(4, RoundingMode::DOWN);
                $points = $scaled->plus($bonus)->toScale(4, RoundingMode::DOWN);

                return [
                    'user_id' => $result['user_id'],
                    'final_score' => $result['final_score']->toScale(1)->__toString(),
                    'rank' => $result['rank'],
                    'points' => $points->__toString(),
                    'score_diff' => $scoreDiff->__toString(),
                    'score_diff_scaled' => $scaled->__toString(),
                    'rank_bonus' => $bonus->__toString(),
                ];
            })
            ->values()
            ->all();
    }

    protected function applyRanks(Collection $results): Collection
    {
        $missingRankCount = $results->filter(fn ($result) => $result['rank'] === null)->count();

        if ($missingRankCount > 0) {
            $sorted = $results
                ->sortByDesc(fn ($result) => $result['final_score'])
                ->values();

            $currentRank = 1;
            $previousScore = null;

            $updated = $sorted->map(function ($result, $index) use (&$currentRank, &$previousScore) {
                if ($previousScore !== null && $result['final_score']->isEqualTo($previousScore)) {
                    // keep current rank
                } else {
                    $currentRank = $index + 1;
                }

                $previousScore = $result['final_score'];

                return [
                    ...$result,
                    'rank' => $result['rank'] ?? $currentRank,
                ];
            });

            return $updated;
        }

        return $results->sortBy('rank')->values();
    }
}
