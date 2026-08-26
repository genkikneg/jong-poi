<?php

namespace App\Http\Requests\Friends;

use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class SendFriendRequestRequest extends FormRequest
{
    protected ?User $recipient = null;

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('identifier')) {
            $this->merge([
                'identifier' => trim((string) $this->input('identifier')),
            ]);
        }
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('identifier')) {
                    return;
                }

                $recipient = $this->recipient();
                $authUser = $this->user();

                if (! $recipient) {
                    $validator->errors()->add('identifier', 'ユーザーIDまたはフレンドコードが見つかりません。');

                    return;
                }

                if ($authUser && $recipient->is($authUser)) {
                    $validator->errors()->add('identifier', '自分自身をフレンドに追加することはできません。');

                    return;
                }

                if ($authUser && $authUser->isFriendsWith($recipient)) {
                    $validator->errors()->add('identifier', 'このユーザーとはすでにフレンドです。');

                    return;
                }

                if ($authUser && $authUser->hasPendingFriendRequestWith($recipient)) {
                    $validator->errors()->add('identifier', 'このユーザーとのフレンド申請はすでに保留中です。');
                }
            },
        ];
    }

    public function recipient(): ?User
    {
        if ($this->recipient !== null) {
            return $this->recipient;
        }

        if (! $this->input('identifier')) {
            return null;
        }

        $identifier = (string) $this->input('identifier');

        return $this->recipient = User::query()
            ->where('friend_code', Str::upper($identifier))
            ->orWhere('user_id', Str::lower($identifier))
            ->first();
    }
}
