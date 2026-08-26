<?php

namespace App\Http\Requests\Operations;

use App\Models\Game;
use App\Services\GameResultsValidator;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class CorrectGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $game = $this->game();
        $maxRank = $game?->session?->player_count ?? 4;

        return [
            'reason' => ['required', 'string', 'max:500'],
            'played_at' => ['nullable', 'date'],
            'results' => ['required', 'array', 'min:1'],
            'results.*.user_id' => ['required', 'integer', 'distinct'],
            'results.*.final_score' => ['required', 'numeric', 'between:-9999999,9999999'],
            'results.*.rank' => ['nullable', 'integer', 'min:1', 'max:'.$maxRank],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $game = $this->game();

            if (! $game || $validator->errors()->isNotEmpty()) {
                return;
            }

            $errors = app(GameResultsValidator::class)->validate(
                $game->session,
                $this->input('results', []),
            );

            foreach ($errors as $field => $message) {
                $validator->errors()->add($field, $message);
            }
        }];
    }

    public function game(): ?Game
    {
        $game = $this->route('game');

        return $game instanceof Game ? $game : null;
    }

    /**
     * @return array<int, array{user_id:int, final_score:string, rank:int|null}>
     */
    public function resultPayload(): array
    {
        return collect($this->input('results', []))
            ->map(fn (array $result) => [
                'user_id' => (int) $result['user_id'],
                'final_score' => (string) $result['final_score'],
                'rank' => isset($result['rank']) ? (int) $result['rank'] : null,
            ])
            ->all();
    }
}
