<?php

namespace Tests\Feature;

use App\Providers\AppServiceProvider;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class ProductionUrlGenerationTest extends TestCase
{
    public function test_https_scheme_can_be_forced_for_generated_urls(): void
    {
        config([
            'app.force_https' => true,
            'app.url' => 'http://example.test',
        ]);
        URL::forceRootUrl('http://example.test');

        try {
            (new AppServiceProvider(app()))->boot();

            $this->assertSame('https://example.test/login', URL::to('/login'));
            $this->get('/avatars/00000000-0000-4000-8000-000000000000')
                ->assertRedirect('https://example.test/login');

            $signedUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinute(),
                ['id' => 1, 'hash' => 'test'],
            );
            $this->assertStringStartsWith('https://example.test/', $signedUrl);
        } finally {
            URL::forceScheme(null);
            URL::forceRootUrl(null);
        }
    }
}
