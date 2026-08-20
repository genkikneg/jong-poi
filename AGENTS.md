# リポジトリガイドライン

日本語で回答してください。

## 構成

- `app/`: Laravelのアプリケーションコード
- `config/`, `bootstrap/`, `routes/`: 設定・起動処理・ルート
- `resources/js/`: React / Inertia。pages、components、layoutsを中心に配置
- `resources/css/`, `resources/views/`, `public/`: スタイル・Blade・公開アセット
- `database/`: migration、factory、seeder
- `tests/Feature`, `tests/Unit`: HTTP/統合テスト、純粋ロジックのテスト
- `docker/`, `deploy/`, `ops/`: コンテナ、VPS構成、運用スクリプト
- `.github/workflows/`: CI/CD、バックアップ、監視

`resources/js/actions`、`resources/js/routes`、`resources/js/wayfinder`、`public/build`は生成物です。直接編集せず、生成元を変更してください。

## 環境とコマンド

CIと本番DockerはPHP 8.5、CIはNode.js 22を使用します。

```bash
composer install
npm ci
cp .env.example .env
php artisan key:generate
```

- 開発: `composer dev`
- PHP整形: `composer lint`
- PHP検査・テスト: `composer test`
- 依存監査: `composer audit --locked`
- Frontend検査: `npm run format:check && npm run lint && npm run types`
- 本番ビルド: `npm run build`
- 運用スクリプト検査: `bash -n ops/*.sh`

変更後は対象範囲の検査を実行し、push前は原則として上記CI相当の検査を通してください。

## 実装とテスト

- PHPはLaravel Pint、React/TypeScriptはPrettier・ESLintに従う。
- PHPは4スペース、クラスはStudlyCase、DBカラムはsnake_case。
- ReactコンポーネントはPascalCase、Hook・関数はcamelCase。
- TailwindクラスはPrettier pluginに任せ、手作業で並べ替えない。
- 名前空間とディレクトリを一致させ、責務が分かる浅い構成を優先する。
- ドメインロジックでは不要なFacade依存を避ける。

機能追加・不具合修正は原則Red / Green / Refactorで進め、外部から観測できる振る舞いをテストしてください。設定変更、依存更新、生成コードなど、TDDの効果が低い変更は例外です。

- HTTP変更: `tests/Feature`で認証・認可・入力・レスポンスを確認
- 純粋ロジック: `tests/Unit`へ分離
- DBテスト: `RefreshDatabase`を利用
- 新しいModel: 必要に応じてFactoryを追加

テストを通すために仕様を変えたり、意味のない分岐やハードコードを追加したりしないでください。

## GitとPull Request

- 作業前に現在のブランチと差分を確認し、既存のユーザー変更を保持する。
- 機能・修正ごとにブランチを分ける。
- コミットは簡潔な命令形を基本とし、1行目は72文字以内を目安にする。
- PRには変更理由、実行した検査、UI変更時の画像、関連Issueを日本語で記載する。
- migration、環境変数、キューワーカー再起動などの追加作業はPRで明示する。
- 公開リポジトリのため、脆弱性の再現方法や本番構成の詳細は公開Issue・PRへ書かない。

## セキュリティとインフラ

- Secretは`.env`またはGitHub/VPSのSecret管理へ置き、コード・ログ・Issue・PRへ含めない。
- APIキーや非公開値をReactへ埋め込まない。必要な値はバックエンド経由で渡す。
- `.env.example`にはキー名と安全なプレースホルダーだけを書く。
- 外部入力にはバリデーションと認可を適用し、ユーザー列挙や個人情報露出を避ける。
- GitHub Actionsは最小権限とし、外部Actionは完全なコミットSHAで固定する。
- Dockerイメージに`.env`、秘密鍵、DBダンプを含めない。
- VPSは複数アプリ構成。共有gatewayとアプリ固有のCompose・network・volume・Secretの境界を維持する。
- 本番、GitHub設定、VPSを変更する場合は、依頼範囲を確認し、バックアップ・ロールバック・外部検証を行う。

脆弱性の詳細は公開IssueではなくDraft Security Advisoryまたは非公開管理先で扱ってください。

## 依存関係

標準機能、Laravel、既存依存、信頼できるOSS、独自実装の順に検討します。新しい依存を追加する場合は、保守状況、利用実績、既知の脆弱性、ライセンス、配布元、インストールスクリプト、推移依存を確認してください。単純な処理のために大きな依存を増やさないでください。
