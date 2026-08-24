<?php

namespace App\Http\Requests\Sessions;

use App\Models\Session;
use App\Services\GameResultsValidator;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $session = $this->session();

        return $this->user() !== null
            && $session !== null
            && $session->members()->where('user_id', $this->user()->id)->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $maxRank = $this->session()?->player_count ?? 4;

        return [
            'played_at' => ['nullable', 'date'],
            'results' => ['required', 'array', 'min:1'],
            'results.*.user_id' => ['required', 'integer', 'distinct'],
            'results.*.final_score' => ['required', 'numeric', 'between:-9999999,9999999'],
            'results.*.rank' => ['nullable', 'integer', 'min:1', 'max:'.$maxRank],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $session = $this->session();

            if (! $session || $validator->errors()->isNotEmpty()) {
                return;
            }

            $errors = app(GameResultsValidator::class)->validate(
                $session,
                $this->input('results', []),
            );

            foreach ($errors as $field => $message) {
                $validator->errors()->add($field, $message);
            }
        }];
    }

    public function session(): ?Session
    {
        $session = $this->route('session');

        return $session instanceof Session ? $session : null;
    }

    public function resultPayload(): array
    {
        return collect($this->input('results', []))
            ->map(fn ($result) => [
                'user_id' => (int) ($result['user_id'] ?? 0),
                'final_score' => (string) ($result['final_score'] ?? 0),
                'rank' => $result['rank'] ?? null,
            ])
            ->all();
    }
}
