<?php

namespace App\Http\Requests;

use App\Services\PlayerStatisticsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StatusFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'period' => ['nullable', Rule::in(PlayerStatisticsService::PERIODS)],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'player_count' => ['nullable', 'integer', 'in:3,4'],
            'opponent_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    public function filters(): array
    {
        return [
            'period' => $this->validated('period', 'all'),
            'from' => $this->validated('from'),
            'to' => $this->validated('to'),
            'player_count' => $this->validated('player_count') ? (int) $this->validated('player_count') : null,
            'opponent_id' => $this->validated('opponent_id') ? (int) $this->validated('opponent_id') : null,
        ];
    }
}
