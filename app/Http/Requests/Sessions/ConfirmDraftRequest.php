<?php

namespace App\Http\Requests\Sessions;

use App\Models\Session;
use Illuminate\Foundation\Http\FormRequest;

class ConfirmDraftRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $session = $this->session();

        return $this->user() !== null
            && $session !== null
            && $session->owner_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }

    public function session(): ?Session
    {
        $session = $this->route('session');

        return $session instanceof Session ? $session : null;
    }
}
