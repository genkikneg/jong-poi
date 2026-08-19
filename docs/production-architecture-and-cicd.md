# 本番アーキテクチャ・CI/CD 方針

## 1. この文書の目的

この文書は、1台のVPSに複数のWebアプリケーションを安全に配置し、各アプリを独立して保守・デプロイできる構成を定義する。

本プロジェクト `jong-poi` では、次の優先順位で設計する。

1. 本番データを失わないこと
2. 他のアプリへ影響を与えないこと
3. 障害時に原因を確認し、以前のバージョンへ戻せること
4. 日常の更新手順を単純化すること
5. 不要な権限と外部公開範囲を減らすこと

この文書は設計方針であり、記載された目標構成への移行が完了するまでは「現在の構成」が本番の実態となる。

## 2. 現在の本番環境

2026年8月19日にVPSを読み取り専用で確認した結果は次のとおり。

| 項目 | 現在の状態 |
| --- | --- |
| OS | Ubuntu 24.04 LTS |
| Docker | Docker 29.2.1 / Docker Compose 5.1.0 |
| Compose | `/var/www/infra/docker-compose.yml` |
| 公開URL | `https://jong-poi.misoon.net` |
| Web | `nginx:1.27-alpine` |
| Application | PHP-FPMをVPS上のソースからビルド |
| Database | `mysql:8.0` |
| TLS | Let's Encrypt、certbot timer有効 |
| DB永続化先 | `/var/www/db/data` |
| 自動デプロイ | なし |

現在の構成には次の課題がある。

- 共通Nginx、jong-poi、MySQLが1つのComposeプロジェクトに混在している。
- コンテナに再起動ポリシーとヘルスチェックがない。
- Laravelの永続ストレージがコンテナ外へ明示的にマウントされていない。
- Nginxはホスト上の`public`を参照し、PHP-FPMはイメージ内のコードを参照しているため、バージョンがずれる可能性がある。
- VPS上でGitのソースコードを取得してDockerイメージをビルドしている。
- 定期バックアップを確認できず、確認できたDBバックアップは2026年3月4日のものだった。
- Dockerイメージに一意なリリース番号がなく、ロールバックしにくい。

## 3. 採用する構成

### 3.1 基本方針

VPS全体で共通化するのは、HTTP/HTTPSの入口となるリバースプロキシだけとする。アプリケーション、データベース、環境変数、永続データ、バックアップ、デプロイ処理はアプリ単位で分離する。

```text
Internet
   |
   v
共通gateway（80/443のみ公開）
   |
   +-- jong-poi-web -- jong-poi-app -- jong-poi-db
   |
   +-- app-b-web ---- app-b-app ---- app-b-db
   |
   +-- app-c-web ---- app-c-app ---- app-c-db
```

共通gatewayはアプリごとのHTTP入口にだけ接続する。データベースはアプリ専用の内部ネットワークに置き、gatewayや他アプリから直接接続できないようにする。

### 3.2 VPSのディレクトリ

```text
/opt/
├── gateway/
│   ├── compose.yaml
│   └── nginx/
│       ├── conf.d/
│       └── snippets/
│
└── apps/
    ├── jong-poi/
    │   ├── compose.yaml
    │   ├── .env
    │   ├── db.env
    │   ├── deploy.env
    │   ├── storage/
    │   └── backups/
    │
    └── another-app/
        ├── compose.yaml
        ├── .env
        ├── deploy.env
        ├── storage/
        └── backups/
```

- `.env`はLaravelの本番設定を保持する。
- `db.env`はアプリへ渡さないMySQL rootパスワードだけを保持する。
- `deploy.env`はデプロイ対象のDockerイメージタグなど、秘密ではないリリース情報を保持する。
- `storage`と`backups`はアプリごとに分離する。
- VPSにはアプリのGit作業ツリーを置かず、実行物はContainer Registryから取得する。

### 3.3 Composeプロジェクト

アプリごとに固定されたComposeプロジェクト名を使用する。

```bash
docker compose \
  --project-name jong-poi \
  --file /opt/apps/jong-poi/compose.yaml \
  up -d
```

これにより、コンテナ、ネットワーク、ボリュームの名前が他アプリと衝突しないようにする。デプロイ処理は必ず対象アプリのComposeファイルとプロジェクト名を明示する。

### 3.4 ネットワーク

各アプリは少なくとも次の2種類のネットワークを使用する。

- `proxy`: 共通gatewayとアプリのHTTP入口だけが参加する。
- `jong-poi-internal`: jong-poiのWeb、PHP-FPM、DBだけが参加する内部ネットワーク。

DBコンテナは`proxy`へ接続せず、ホストへの`ports`も設定しない。他アプリ用DBも同様に分離する。

### 3.5 データベース

新しいアプリは、原則としてアプリ専用DBコンテナ、専用DBユーザー、専用パスワード、専用バックアップを持つ。

VPSのメモリ制約によりDBサーバーを共有する場合も、次をアプリごとに分離する。

- データベース名
- DBユーザー
- パスワード
- バックアップファイル
- 復元手順

現在のMySQLデータは、検証済みバックアップを作成するまで移動・再作成しない。

### 3.6 Dockerイメージ

GitHub Actionsで本番イメージをビルドし、GitHub Container Registry（GHCR）へ保存する。

```text
ghcr.io/genkikneg/jong-poi:<commit-sha>
```

デプロイにはコミットSHAの固定タグを使用する。`latest`タグだけを本番の根拠にしない。

Web用イメージとPHP-FPM用イメージを分ける場合も、同じコミットから作り、同じSHAで識別する。これにより、Nginxが配信する静的ファイルとPHPコードのバージョンを一致させる。

## 4. セキュリティ方針

### 4.1 外部公開

- インターネットへ公開するポートは、原則としてSSH、80、443だけとする。
- アプリ、PHP-FPM、MySQL、Redisなどのポートは外部公開しない。
- ドメインごとのTLS終端は共通gatewayで行う。
- Nginxのセキュリティヘッダーとdotfile拒否設定を維持する。

### 4.2 コンテナ

- 可能な限り非rootユーザーでプロセスを実行する。
- `privileged: true`を使用しない。
- Dockerソケットをアプリコンテナへマウントしない。
- Linux capabilityは必要最小限にする。
- 書き込みが必要なディレクトリ以外は読み取り専用化を検討する。
- イメージ内へ`.env`、SSH鍵、APIキーなどをコピーしない。
- イメージのベースバージョンを固定し、Dependabot等で定期更新する。

### 4.3 秘密情報

- Laravelの秘密情報はVPS上の`/opt/apps/jong-poi/.env`で管理する。
- `.env`をGit、Dockerイメージ、GitHub Actionsのログへ出力しない。
- `.env`の権限はデプロイユーザーだけが読める状態を基本とする。
- GitHub SecretsにはVPS接続に必要な情報だけを登録する。
- 本番SSH鍵はデプロイ専用にし、可能なら実行可能コマンドや権限を制限する。

### 4.4 GitHub Actionsの権限

- ワークフローの`permissions`はジョブごとに必要最小限にする。
- CIは原則`contents: read`だけを使用する。
- GHCRへの公開時だけ`packages: write`を許可する。
- Pull Request由来の任意コードへ本番Secretを渡さない。
- 本番デプロイにはGitHub Environmentの`production`を使用する。
- 導入初期は`production`に手動承認を設定する。

## 5. CI方針

Pull Requestと`main`へのpushで、少なくとも次を検証する。

1. Composer依存関係の再現可能なインストール
2. npm依存関係の`npm ci`によるインストール
3. Laravel Pintのチェックモード
4. Prettierのチェックモード
5. ESLintの非修正モード
6. TypeScript型チェック
7. PHPUnit
8. Vite本番ビルド
9. 本番Dockerイメージのビルド

CIはコードを自動修正しない。フォーマット違反やLintエラーがある場合は失敗させ、開発環境で修正してコミットする。

現在はPHPUnit 1件、TypeScript、Pint、Prettier等のエラーが残っているため、CDを有効にする前にCIを正常化する。

## 6. CD方針

### 6.1 トリガー

- CIがすべて成功した`main`へのpushだけを本番候補とする。
- 初期運用ではGitHub Environmentで手動承認後にデプロイする。
- 同時デプロイを防ぐため、GitHub Actionsの`concurrency`を設定する。

### 6.2 デプロイ手順

```text
1. GitHub Actionsでイメージをビルド
2. コミットSHA付きでGHCRへpush
3. productionの承認
4. VPSへデプロイ専用SSHユーザーで接続
5. 現在のイメージタグを記録
6. DBバックアップを作成して検証
7. 新しいイメージをpull
8. 必要なマイグレーションを実行
9. jong-poiだけを更新
10. ヘルスチェック
11. 成功したリリース情報を記録
```

デプロイは`/opt/apps/jong-poi`だけを対象とする。gatewayや他アプリを通常のjong-poiデプロイから更新しない。

### 6.3 禁止する処理

通常のデプロイでは、VPS全体へ影響する次のような処理を実行しない。

```bash
docker stop $(docker ps -q)
docker system prune
docker volume prune
docker network prune
```

プロジェクト名を指定しない`docker compose down`も使用しない。DBコンテナとボリュームを不用意に削除しない。

### 6.4 マイグレーション

- 本番マイグレーションの直前にDBバックアップを取得する。
- 原則として、旧バージョンと新バージョンの両方で動作する後方互換な変更にする。
- カラム削除や型変更は、追加・移行・参照切替・削除の複数リリースへ分割する。
- `down`処理だけにロールバックを依存しない。

## 7. ヘルスチェックと復旧

### 7.1 ヘルスチェック

最低限、次を確認する。

- MySQLが接続可能であること
- PHP-FPMまたはアプリプロセスが応答すること
- アプリのヘルスチェックURLがHTTP 200を返すこと
- Nginxが対象アプリへ到達できること

認証ページへの302リダイレクトではなく、依存サービスを確認できる専用エンドポイントを用意する。

全サービスに適切な`healthcheck`と`restart: unless-stopped`を設定する。

### 7.2 アプリのロールバック

直前のコミットSHAへ`deploy.env`のイメージタグを戻し、対象アプリだけを再作成する。

```bash
docker compose \
  --project-name jong-poi \
  --file /opt/apps/jong-poi/compose.yaml \
  --env-file /opt/apps/jong-poi/deploy.env \
  up -d
```

アプリイメージを戻してもDBスキーマは自動では戻らない。破壊的なマイグレーションを避け、DB復元が必要な場合は影響範囲を確認して手動で実施する。

## 8. バックアップ

### 8.1 対象

- MySQLデータベース
- Laravelの永続ストレージ
- 本番`.env`
- Compose設定
- gatewayのNginx設定
- 使用中のイメージタグ

### 8.2 運用

- DBは最低でも毎日バックアップする。
- デプロイ直前にもバックアップする。
- 保存期間を決め、古い世代を安全に削除する。
- VPS内のバックアップだけでなく、暗号化した外部保存先を用意する。
- バックアップ作成の成功だけでなく、定期的に復元できることを確認する。

バックアップは「存在すること」ではなく「復元試験に成功していること」を完了条件とする。

## 9. 監視とログ

- Laravelログは可能な範囲で標準出力・標準エラーへ送る。
- `docker compose logs`でアプリ単位に確認できるようにする。
- Dockerログのローテーションと上限を設定する。
- ディスク使用率、コンテナ再起動、HTTP応答、証明書更新失敗を監視対象とする。
- デプロイの実行者、コミットSHA、開始・終了時刻、結果をGitHub Actionsへ残す。
- 機密値、Cookie、Authorizationヘッダーをログへ記録しない。

## 10. 新しいアプリを追加する手順

1. `/opt/apps/<app-name>`を作成する。
2. 固有のComposeプロジェクト名を決める。
3. アプリ専用の内部ネットワーク、DB、ユーザー、ストレージ、バックアップ先を作る。
4. アプリのHTTP入口だけを`proxy`ネットワークへ参加させる。
5. gatewayへドメイン設定を追加して構文検査する。
6. DNSを設定する。
7. TLS証明書を取得する。
8. CI、GHCR、CD、GitHub Environmentを設定する。
9. ヘルスチェックとバックアップ復元を検証する。
10. 他の稼働中アプリに影響がないことを確認する。

## 11. 移行計画

本番移行は次のフェーズに分け、一度に全面変更しない。

### Phase 1: 安全確保

- 最新DBバックアップの作成
- 永続ファイルの調査とバックアップ
- `.env`、Compose、Nginx設定の退避
- DB復元試験

実施済み。結果は[Phase 1 バックアップ・復元確認記録](phase-1-backup-report.md)を参照。

### Phase 2: CI正常化

- 既存GitHub Actionsの権限とコマンドを修正
- PHPUnit、TypeScript、Pint、Prettier、ESLintのエラーを解消
- ブランチ保護を設定

リポジトリ内の修正は実施済み。結果は[Phase 2 CI正常化 実施記録](phase-2-ci-report.md)を参照。ブランチ保護は新CIをGitHubへpushし、初回成功を確認した後に設定する。

### Phase 3: イメージとVPS設定の準備

- 再現可能な本番イメージを作成
- GHCRへの公開を設定
- gatewayとjong-poiのComposeを分離
- 永続ストレージ、ヘルスチェック、再起動設定を追加
- バックアップとデプロイスクリプトを作成

実施済み。結果は[Phase 3 コンテナ基盤 実施記録](phase-3-container-platform.md)を参照。本番環境はまだ旧構成のままであり、切替はPhase 4で行う。

### Phase 4: 本番切替

- メンテナンス時間を確保
- 直前バックアップ
- 新構成を既存ポートと競合しない状態で検証
- gatewayの接続先を新構成へ切替
- HTTP、ログイン、DB更新、画像表示を確認

### Phase 5: 安定化

- 数日間ログとリソース使用量を確認
- ロールバック手順を検証
- 不要になった旧コンテナと旧ファイルは、バックアップ保持期間後に明示的な承認を得て削除

## 12. 完了条件

次をすべて満たした時点で移行完了とする。

- PRでCIが必須化され、すべて成功する。
- mainからコミットSHA付きイメージを作成できる。
- jong-poiだけを独立してデプロイ・停止・再起動できる。
- VPS再起動後にサービスが自動復旧する。
- DBと永続ファイルのバックアップ・復元が検証されている。
- デプロイ後のヘルスチェックが自動実行される。
- 直前イメージへロールバックできる。
- 他アプリのコンテナ、ネットワーク、DB、ファイルを操作せずにデプロイできる。

## 13. 今後の実装順

この方針に基づき、まずリポジトリ側でCIを正常化する。その後、本番Dockerイメージ、VPS用Compose、バックアップ、CDの順に実装する。本番VPSの変更は、設定レビューとバックアップ・復元確認が完了してから行う。
