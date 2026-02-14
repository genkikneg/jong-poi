<?php

namespace App\Http\Requests\Sessions;

use App\Models\Session;
use Illuminate\Foundation\Http\FormRequest;

class StoreDraftEntryRequest extends FormRequest
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
        $session = $this->session();
        $maxRank = $session?->player_count ?? 4;

        return [
            'final_score' => ['required', 'integer'],
            'rank' => ['nullable', 'integer', 'min:1', 'max:'.$maxRank],
        ];
    }

    public function session(): ?Session
    {
        $session = $this->route('session');

        return $session instanceof Session ? $session : null;
    }

    public function entryPayload(): array
    {
        return [
            'final_score' => (int) $this->input('final_score'),
            'rank' => $this->input('rank') !== null ? (int) $this->input('rank') : null,
        ];
    }
}
