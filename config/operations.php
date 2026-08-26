<?php

return [
    'admin_user_ids' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('OPERATIONS_ADMIN_USER_IDS', 'admin,misooon')),
    ))),

    'password' => env('OPERATIONS_PASSWORD'),

    'verification_minutes' => (int) env('OPERATIONS_VERIFICATION_MINUTES', 15),

    'recovery_code_minutes' => (int) env('OPERATIONS_RECOVERY_CODE_MINUTES', 30),
];
