<?php

namespace App\Events;

use App\Models\Session;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionStateUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Session $session,
        public readonly string $action,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('sessions.'.$this->session->id)];
    }

    public function broadcastAs(): string
    {
        return 'session.state-updated';
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->session->id,
            'action' => $this->action,
        ];
    }
}
