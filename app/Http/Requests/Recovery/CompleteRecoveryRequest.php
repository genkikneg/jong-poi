<?php

namespace App\Http\Requests\Recovery;

use App\Concerns\PasswordValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class CompleteRecoveryRequest extends FormRequest
{
    use PasswordValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password' => $this->passwordRules(),
        ];
    }
}
