# Phase 3 コンテナ基盤 実施記録

## 実施結果

2026年8月19日、ブランチ`infra/phase-3-docker`でPhase 3「イメージとVPS設定の準備」を実施した。

本番用イメージ、GHCR公開処理、共通gateway、アプリ専用Compose、バックアップ・復元・デプロイ・ロールバック処理をリポジトリへ追加した。VPSでは`/var/tmp`の専用領域、専用Composeプロジェクト、専用ネットワーク、空の専用DBを使って検証した。本番のコンテナ、データ、設定、公開ポートは変更していない。

## 構成

共通gatewayだけがホストの80/443番ポートを公開する。`jong-poi-web`だけが共有`proxy`ネットワークへ参加し、PHP-FPM、キュー、MySQLはアプリ固有の内部ネットワークだけを使用する。

```text
Internet
   |
gateway nginx (80/443)
   |
proxy network
   |
jong-poi-web (8080、ホスト非公開)
   |
jong-poi internal network
   +-- app (PHP-FPM 9000、ホスト非公開)
   +-- queue
   +-- db (MySQL 3306、ホスト非公開)
```

別アプリは固有のComposeプロジェクト、内部ネットワーク、DB、永続ディレクトリを持ち、HTTP入口だけを`proxy`へ追加する。このため、1台のVPSへ複数アプリを配置する前提を維持している。

## 主な実装

### 本番イメージ

- `Dockerfile.prod`を`app`と`web`のマルチターゲット構成にした。
- Composerは`--no-dev --classmap-authoritative`、Nodeは`npm ci`を使用する。
- PHP、Composer、Node、Nginxのベースイメージをdigestで固定した。
- `.env`、Git履歴、開発依存、ローカルキャッシュをビルドコンテキストから除外した。
- 開発時のLaravelパッケージキャッシュが本番イメージへ混入しないようにした。
- PHP-FPM、Nginxのヘルスチェックを追加した。

### GitHub Actions / GHCR

Pull Requestでは品質チェック成功後に`app`と`web`の本番イメージをビルドする。`main`へのpushでは同じチェック後に次のイメージをGHCRへ公開する。

```text
ghcr.io/genkikneg/jong-poi-app:<commit-sha>
ghcr.io/genkikneg/jong-poi-web:<commit-sha>
```

本番では変更可能な`main`タグではなく、40文字のコミットSHAを使う。Docker関連ファイルもDependabotの週次更新対象にした。

### VPS用Compose

- `deploy/gateway`: VPS共通のTLS終端とリバースプロキシ
- `deploy/jong-poi`: app、queue、web、DBをアプリ単位で管理
- DBと永続storageは`/opt/apps/jong-poi`配下に分離
- webは`storage/public`だけを読み取り専用でマウントし、`public/storage`リンク経由で配信
- app、queue、webのルートファイルシステムを読み取り専用化
- 書き込みが必要なLaravelキャッシュ等だけをtmpfs化
- `no-new-privileges`、再起動ポリシー、ログローテーションを設定
- Laravel用`.env`とMySQL root用`db.env`を分離し、root秘密情報をアプリへ渡さない
- `PROXY_NETWORK`を明示でき、隔離テストや複数環境で共有ネットワーク名を変更可能

### 運用スクリプト

| ファイル | 役割 |
| --- | --- |
| `ops/prepare-host.sh` | アプリ専用ディレクトリと共有proxyネットワークを作成 |
| `ops/backup.sh` | DB、storage、設定、利用中イメージ情報を保存しチェックサムを作成 |
| `ops/restore-check.sh` | ネットワークなしの一時MySQLへ復元し、全テーブルと行数を検証 |
| `ops/deploy.sh` | バックアップ後にSHA固定イメージをpullし、マイグレーションとヘルスチェックを実行 |
| `ops/rollback.sh` | 直前のapp/web SHAへ戻す。DBスキーマは自動で戻さない |

## 検証結果

VPS上の隔離環境で次を確認した。

| 検証 | 結果 |
| --- | --- |
| `app`本番イメージビルド | 成功 |
| `web`本番イメージビルド | 成功 |
| Compose設定検証 | 成功 |
| MySQL初期化 | 成功 |
| Laravelマイグレーション | 14件成功 |
| app / queue / web / db起動 | 成功 |
| 全ヘルスチェック | healthy |
| `/up`とトップページ | HTTP応答成功 |
| app / queue / web読み取り専用 | 確認済み |
| ホストへのアプリ・DBポート公開なし | 確認済み |
| バックアップ | 成功 |
| 別MySQLへの復元試験 | 18テーブル、16行で成功 |
| PHPUnit | 50テスト、202 assertions成功 |
| Pint / Prettier / ESLint / TypeScript / Vite | 成功 |
| npm本番依存監査 | 既知脆弱性0件 |
| Bash構文 / Git whitespace | 成功 |

検証用コンテナ、ネットワーク、イメージ、`/var/tmp`のデータは検証後に削除した。これらは一時生成物であり復旧対象ではない。本番の`infra-jong-poi-1`、`infra-nginx-1`、`db`は継続稼働している。

## Phase 4へ進む条件

1. このブランチからPull Requestを作り、`Test and build`とDocker 2ジョブの成功を確認する。
2. マージ後、GHCRに同じコミットSHAのapp/webイメージが存在することを確認する。
3. VPSからGHCRを読むための資格情報を安全に登録する。
4. メンテナンス時間と切戻し判断者を決める。
5. [本番切替ランブック](production-cutover-runbook.md)をレビューしてからPhase 4を実施する。
