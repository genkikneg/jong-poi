<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('rankings:rebuild --period=month --queue')
    ->monthlyOn(1, '00:05')
    ->timezone('Asia/Tokyo')
    ->withoutOverlapping();

Schedule::command('rankings:rebuild --period=year --queue')
    ->yearlyOn(1, 1, '00:10')
    ->timezone('Asia/Tokyo')
    ->withoutOverlapping();

Schedule::command('rankings:rebuild --queue')
    ->weeklyOn(1, '03:00')
    ->timezone('Asia/Tokyo')
    ->withoutOverlapping();
