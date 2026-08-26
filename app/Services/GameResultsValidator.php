<?php

namespace App\Services;

use App\Models\Session;
use Brick\Math\BigDecimal;
use Illuminate\Support\Collection;

class GameResultsValidator
{
    /**
     * @param  iterable<array{user_id:int|string, final_score:int|float|string, rank?:int|string|null}|object>  $rawResults
     * @return array<string, string>
     */
    public function validate(Session $session, iterable $rawResults): array
    {
        $results = collect($rawResults)->map(fn ($result) => $this->normalize($result));
        $errors = [];

        if ($results->count() !== $session->player_count) {
            $errors['results'] = __('参加人数分のスコアを入力してください。');
        }

        $submittedIds = $results->pluck('user_id');

        if ($submittedIds->unique()->count() !== $submittedIds->count()) {
            $errors['results'] = __('同じ参加者のスコアが複数含まれています。');
        }

        $memberIds = $session->members()->pluck('user_id')->map(fn ($id) => (int) $id);

        if (
            $submittedIds->sort()->values()->all() !==
            $memberIds->sort()->values()->all()
        ) {
            $errors['results'] = __('参加メンバー全員のスコアを1人1件ずつ入力してください。');
        }

        if ($results->isNotEmpty()) {
            $total = $this->total($session, $results);

            if (! $total['difference']->isZero()) {
                $errors['results'] = sprintf(
                    '点数の合計が一致しません（合計差分: %s点）。',
                    $this->formatPoints($total['difference'], signed: true),
                );
            }
        }

        if (! $this->ranksMatchScores($results)) {
            $errors['results'] = __('順位がスコア順と一致しません。');
        }

        return $errors;
    }

    /**
     * @param  array{user_id:int|string, final_score:int|float|string, rank?:int|string|null}|object  $result
     * @return array{user_id:int, final_score:string, rank:?int}
     */
    private function normalize(array|object $result): array
    {
        return [
            'user_id' => (int) data_get($result, 'user_id', 0),
            'final_score' => (string) data_get($result, 'final_score', 0),
            'rank' => data_get($result, 'rank') !== null
                ? (int) data_get($result, 'rank')
                : null,
        ];
    }

    /**
     * @param  Collection<int, array{user_id:int, final_score:string, rank:?int}>  $results
     * @return array{difference:BigDecimal}
     */
    private function total(Session $session, Collection $results): array
    {
        $actual = $results->reduce(
            fn (BigDecimal $total, array $result) => $total->plus($result['final_score']),
            BigDecimal::zero(),
        );
        $expected = BigDecimal::of((string) $session->rule_base)
            ->multipliedBy($session->player_count);

        return [
            'difference' => $actual->minus($expected),
        ];
    }

    private function formatPoints(BigDecimal $points, bool $signed = false): string
    {
        $formatted = preg_replace('/\\.0+$/', '', $points->toScale(1)->__toString());

        return $signed && $points->isPositive() ? "+{$formatted}" : $formatted;
    }

    /**
     * @param  Collection<int, array{user_id:int, final_score:string, rank:?int}>  $results
     */
    private function ranksMatchScores(Collection $results): bool
    {
        $sorted = $results
            ->sort(fn (array $left, array $right) => BigDecimal::of($right['final_score'])
                ->compareTo(BigDecimal::of($left['final_score'])))
            ->values();
        $previousScore = null;
        $currentRank = 1;

        foreach ($sorted as $index => $result) {
            $score = BigDecimal::of($result['final_score']);

            if ($previousScore === null || ! $score->isEqualTo($previousScore)) {
                $currentRank = $index + 1;
            }

            if ($result['rank'] !== null && $result['rank'] !== $currentRank) {
                return false;
            }

            $previousScore = $score;
        }

        return true;
    }
}
