<?php

namespace App\Http\Requests\Sessions;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:120'],
            'player_count' => ['required', 'integer', 'in:3,4'],
            'member_ids' => ['required', 'array'],
            'member_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            'rules.base' => ['required', 'numeric'],
            'rules.k' => ['required', 'numeric', 'min:0.001'],
            'rules.rank_bonus' => ['required', 'array'],
            'rules.rank_bonus.*' => ['numeric'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $playerCount = (int) $this->input('player_count');
            $friendIds = $this->friendIds();
            $user = $this->user();

            if ($playerCount && count($friendIds) !== max($playerCount - 1, 0)) {
                $validator->errors()->add('member_ids', __('参加人数とメンバーの数が一致しません。'));
            }

            if ($user) {
                $friendList = $user->friends()->pluck('users.id');
                $diff = collect($friendIds)->diff($friendList);

                if ($diff->isNotEmpty()) {
                    $validator->errors()->add('member_ids', __('指定したユーザーはフレンドではありません。'));
                }
            }
        }];
    }

    /**
     * @return array<int, int>
     */
    public function friendIds(): array
    {
        return collect($this->input('member_ids', []))
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->values()
            ->all();
    }

    public function rulesPayload(): array
    {
        return [
            'base' => $this->input('rules.base'),
            'k' => $this->input('rules.k'),
            'rank_bonus' => $this->rankBonus(),
        ];
    }

    public function rankBonus(): array
    {
        return collect($this->input('rules.rank_bonus', []))
            ->mapWithKeys(fn ($value, $rank) => [(string) $rank => (float) $value])
            ->toArray();
    }
}
