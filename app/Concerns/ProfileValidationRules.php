<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'name' => $this->nameRules(),
            'user_id' => $this->userIdRules($userId),
            'avatar' => $this->avatarRules(),
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user IDs.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function userIdRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'min:3',
            'max:255',
            'regex:/\A[a-z0-9][a-z0-9._+@-]*\z/',
            $userId === null
                ? Rule::unique(User::class, 'user_id')
                : Rule::unique(User::class, 'user_id')->ignore($userId),
        ];
    }

    protected function avatarRules(): array
    {
        return ['nullable', File::image()->max(2 * 1024)];
    }
}
