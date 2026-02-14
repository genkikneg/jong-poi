<?php

namespace App\Http\Requests\Friends;

use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

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
            'friend_code' => ['required', 'string', 'max:12', 'exists:users,friend_code'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('friend_code')) {
            $this->merge([
                'friend_code' => strtoupper((string) $this->input('friend_code')),
            ]);
        }
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('friend_code')) {
                    return;
                }

                $recipient = $this->recipient();
                $authUser = $this->user();

                if ($recipient && $authUser && $recipient->is($authUser)) {
                    $validator->errors()->add('friend_code', __('You cannot add yourself.'));

                    return;
                }

                if ($recipient && $authUser && $authUser->isFriendsWith($recipient)) {
                    $validator->errors()->add('friend_code', __('You are already friends.'));

                    return;
                }

                if ($recipient && $authUser && $authUser->hasPendingFriendRequestWith($recipient)) {
                    $validator->errors()->add('friend_code', __('You already have a pending request with this user.'));
                }
            },
        ];
    }

    public function recipient(): ?User
    {
        if ($this->recipient !== null) {
            return $this->recipient;
        }

        if (! $this->input('friend_code')) {
            return null;
        }

        return $this->recipient = User::where('friend_code', $this->input('friend_code'))->first();
    }
}
