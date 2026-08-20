# 本番切替ランブック（Phase 4）

## 目的と前提

この文書は、現在の`/var/www/infra`構成から、共通gatewayと`/opt/apps/jong-poi`へ安全に切り替えるための手順書である。Phase 3完了時点では本番はまだ旧構成で動いている。

本番切替は停止時間を伴う。実施前に対象コミットSHA、作業開始時刻、切戻し判断時刻を決める。秘密値をターミナル履歴、Git、チャット、GitHub Actionsログへ出力しない。

## 事前条件

- 対象コミットのGitHub Actionsがすべて成功している。
- GHCRに同じSHAの`jong-poi-app`と`jong-poi-web`が存在する。
- Phase 1バックアップを保持している。
- VPSの空き容量、メモリ、証明書期限を確認済みである。
- `/opt/apps/jong-poi`と`/opt/gateway`へPhase 3の設定・スクリプトを配置済みである。
- VPSはGHCRへ`read:packages`相当の最小権限でログイン済みである。
- `.env`、`db.env`、`deploy.env`はモード600で、リポジトリへ追加されていない。

## 設定値

`/opt/apps/jong-poi/.env`は`app.env.example`を基に作る。現在のLaravel秘密値を安全に移し、少なくとも次を確認する。

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://jong-poi.misoon.net`
- `DB_HOST=db`
- DB名・アプリ用ユーザー・パスワードがComposeと一致
- `LOG_CHANNEL=stderr`
- `SESSION_SECURE_COOKIE=true`

`db.env`には新しい長いMySQL rootパスワードだけを置く。`deploy.env`のapp/webには同一の40文字コミットSHAを指定する。

## 切替手順

### 1. 新基盤を準備する

`ops/prepare-host.sh`で専用ディレクトリと共有`proxy`ネットワークを作る。設定ファイルを配置し、次を実行する前にCompose設定を検査する。

```bash
cd /opt/apps/jong-poi
docker compose --env-file .env --env-file db.env --env-file deploy.env config --quiet
```

この時点ではgatewayを起動しない。旧Nginxと80/443番ポートが競合するためである。

### 2. 新しいapp/webイメージを取得する

```bash
cd /opt/apps/jong-poi
docker compose --env-file .env --env-file db.env --env-file deploy.env pull app queue jong-poi-web
```

### 3. メンテナンスモードへ入る

旧アプリをメンテナンスモードにし、以降の書き込みを止める。

```bash
docker exec infra-jong-poi-1 php artisan down
```

公開URLがメンテナンス応答になったことを確認する。ここから直前バックアップ完了までは旧DBを更新しない。

### 4. 直前バックアップを取得・復元確認する

旧MySQLの論理ダンプ、コンテナ内`storage/app`、旧Compose、Nginx、`.env`をタイムスタンプ付きの新規ディレクトリへ保存する。チェックサムを作り、別の一時MySQLへの復元試験を完了する。

Phase 1のバックアップを再利用せず、切替直前のデータを必ず使う。保存先と復元結果を作業記録へ残す。失敗した場合はここで中止し、旧アプリを`php artisan up`で戻す。

### 5. 新DBと永続storageを構築する

新構成のDBだけを起動し、healthyを待つ。

```bash
cd /opt/apps/jong-poi
docker compose --env-file .env --env-file db.env --env-file deploy.env up -d db
```

直前ダンプを新DBへ復元する。MySQL rootパスワードはコマンド行へ展開せず、DBコンテナ内の環境変数を使う。直前バックアップの`storage/app`内容を`/opt/apps/jong-poi/storage`へ復元し、所有者をUID/GID 33へ合わせる。`storage/public`はディレクトリ755・ファイル644とし、Webコンテナへ公開領域だけを読み取り専用で渡す。

復元後に全テーブル数と行数を直前バックアップと照合する。不一致なら切替を中止する。

### 6. 新アプリを非公開状態で確認する

```bash
cd /opt/apps/jong-poi
docker compose --env-file .env --env-file db.env --env-file deploy.env run --rm app php artisan migrate --force
docker compose --env-file .env --env-file db.env --env-file deploy.env up -d app queue jong-poi-web
docker compose --env-file .env --env-file db.env --env-file deploy.env ps
docker compose --env-file .env --env-file db.env --env-file deploy.env exec -T jong-poi-web wget -q --spider http://127.0.0.1:8080/up
```

全サービスがhealthyであること、エラーログがないこと、対象SHAが一致することを確認する。新webにはホストポートがないため、まだ外部公開されない。

### 7. gatewayを切り替える

旧Nginxだけを停止し、共通gatewayを起動する。旧DBと旧アプリは切戻し用に削除しない。

```bash
docker stop infra-nginx-1
cd /opt/gateway
docker compose up -d
```

gatewayの構文、証明書読込、`https://jong-poi.misoon.net`のHTTP 200を確認する。

### 8. 受入確認する

次を順に確認する。

1. `/up`、トップ、ログイン画面
2. 既存ユーザーのログイン
3. 既存フレンド・セッション・履歴の表示
4. 小さなテストデータの登録と再読込
5. 画像など`storage`由来ファイルの表示
6. app、queue、web、db、gatewayのログ
7. CPU、メモリ、ディスク使用量

成功後に旧アプリと旧DBを停止する。ただし削除はPhase 5の安定化と保持期間後に別承認で行う。

## 切戻し

新構成で書き込みを始める前、またはデータ更新がないことを確認できる場合は、gatewayを停止して旧Nginxを再起動し、旧アプリのメンテナンスモードを解除する。

```bash
cd /opt/gateway
docker compose down
docker start infra-nginx-1
docker exec infra-jong-poi-1 php artisan up
```

新DBへ書き込み後は、旧DBへ単純に戻すと新しいデータを失う。メンテナンス状態を維持し、差分データの扱いとバックアップ復元方針を決めてから切り戻す。

通常リリース後にアプリイメージだけを直前SHAへ戻す場合は、`/opt/apps/jong-poi/ops/rollback.sh`を使う。この処理はDBスキーマを自動で戻さない。

## 完了記録

作業記録には、対象SHA、バックアップパスと復元結果、切替時刻、確認項目、実施者、旧構成の停止状態、問題点を残す。
