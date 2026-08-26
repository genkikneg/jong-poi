<?php

return [
    'required' => ':attributeを入力してください。',
    'string' => ':attributeは文字列で入力してください。',
    'email' => ':attributeには有効なメールアドレスを入力してください。',
    'confirmed' => ':attributeの確認が一致しません。',
    'current_password' => '現在のパスワードが正しくありません。',
    'unique' => 'その:attributeはすでに使用されています。',
    'integer' => ':attributeは整数で入力してください。',
    'numeric' => ':attributeは数値で入力してください。',
    'date' => ':attributeには有効な日付を入力してください。',
    'array' => ':attributeの形式が正しくありません。',
    'distinct' => ':attributeに重複した値があります。',
    'min' => [
        'string' => ':attributeは:min文字以上で入力してください。',
        'numeric' => ':attributeは:min以上で入力してください。',
        'array' => ':attributeは:min個以上選択してください。',
    ],
    'max' => [
        'string' => ':attributeは:max文字以内で入力してください。',
        'numeric' => ':attributeは:max以下で入力してください。',
        'array' => ':attributeは:max個以内で選択してください。',
    ],
    'between' => [
        'numeric' => ':attributeは:min〜:maxの範囲で入力してください。',
    ],
    'attributes' => [
        'email' => 'メールアドレス',
        'password' => 'パスワード',
        'password_confirmation' => 'パスワード（確認）',
        'current_password' => '現在のパスワード',
        'name' => '名前',
    ],
];
