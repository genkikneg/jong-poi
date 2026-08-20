# Phase 5 安定化・安全なCD 実施記録

実施日: 2026-08-20（Asia/Tokyo）

## 結果

- 本番`https://jong-poi.misoon.net/up`はVPS内外からHTTP 200。
- app、web、db、gatewayはhealthy。コンテナの異常再起動は確認されなかった。
- queueは`--max-time=3600`による1時間ごとの正常な再起動を確認した。重大ログは0件。
- ディスク使用率は36%、空きは約61GB。
- メモリは960MiB中約340MiBがavailable、swapは4GiB中約3.4GiBが空き。
- TLS証明書の期限は2026-11-08。
- 旧app、旧DB、旧Nginxコンテナは削除せず、停止状態で保持。

## バックアップ復元試験

制限付きSSH経路の実デプロイで次のバックアップを作成した。

```text
/opt/apps/jong-poi/backups/20260820_084822
```

ネットワークへ接続しない一時MySQLコンテナへ復元し、次を確認した。

- 全バックアップファイルのSHA-256チェックサムが一致
- MySQLのテーブル検査が成功
- 18テーブル、437行がバックアップ時の件数と一致
- 一時コンテナは試験後に削除
- 試験中と試験後も本番`/up`はHTTP 200

## 安全なCD

- パスワードを持たないVPSユーザー`deploy`を作成。
- `deploy`は`docker`、`sudo`グループへ所属させていない。
- 専用SSH鍵へ強制コマンドと`restrict`を設定。
- 許可外の`id`命令が終了コード64で拒否されることを確認。
- 許可された`deploy <SHA>`で本番と同じSHAを実デプロイし、バックアップ、マイグレーション、ヘルスチェックが成功。
- デプロイ前後でgatewayのコンテナIDが同一で、他アプリ用の共有入口が更新対象外であることを確認。
- GitHub Environment `production`を作成し、保護されたブランチだけを対象にした。
- `genkikneg`の手動承認を必須化。
- 接続用秘密鍵とknown_hostsはEnvironment Secret、ホスト・ポート・ユーザーはEnvironment Variableへ登録。
- 登録後、ローカルの一時秘密鍵とVPSの転送用一時ファイルを削除。

## SSH

- CDはroot SSHを使用しない。
- 管理用の`ssh genki`を維持しつつ、rootは公開鍵認証だけを許可する。
- パスワード認証と対話認証を明示的に無効化する。
- rootログインを完全に無効化する作業は、代替管理ユーザーを用意して別セッションから確認した後に行う。

## 保留事項

- 新構成を数日間継続監視する。
- Dependabot更新はGitHub Actions関連から1件ずつ適用し、PHP 8.5とNginx 1.31は別々に検証する。
- 旧コンテナ・旧データ・移行時バックアップは保持期限を決め、削除前に明示的な承認を得る。
- VPS外への暗号化バックアップを追加する。

## 初回自動CDで検出した問題

初回のGitHub Actionsデプロイ自体は成功したが、webコンテナの再作成後に共有Nginxが再作成前のコンテナIPを保持し、一時的に`/up`がHTTP 504になった。Nginxの設定再読込で新IPへ切り替え、`/up`、`/login`、gatewayのhealthが正常へ戻った。

恒久対策として次を追加する。

- gatewayのupstreamでDocker内蔵DNS（`127.0.0.11`）を使用する。
- `zone`と`resolve`を指定し、webコンテナのIP変更をgateway再起動なしで追従する。
- 内部webヘルスチェックだけでなく、公開HTTPSの`/up`もデプロイ完了条件にする。
