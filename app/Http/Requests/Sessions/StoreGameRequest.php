<?php

namespace App\Http\Requests\Sessions;

use App\Models\Session;
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
        return [
            'played_at' => ['nullable', 'date'],
            'results' => ['required', 'array', 'min:1'],
            'results.*.user_id' => ['required', 'integer'],
            'results.*.final_score' => ['required', 'numeric'],
            'results.*.rank' => ['nullable', 'integer', 'min:1', 'max:4'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $session = $this->session();

            if (! $session) {
                return;
            }

            $results = collect($this->input('results', []));

            if ($results->count() !== $session->player_count) {
                $validator->errors()->add('results', __('参加人数分のスコアを入力してください。'));
            }

            $memberIds = $session->members()->pluck('user_id');
            $diff = $results->pluck('user_id')->map(fn ($id) => (int) $id)->diff($memberIds);

            if ($diff->isNotEmpty()) {
                $validator->errors()->add('results', __('セッションメンバー以外のスコアが含まれています。'));
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
