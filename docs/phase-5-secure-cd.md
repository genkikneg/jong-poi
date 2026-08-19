# Phase 5: 安定化と安全なCD

## 目的

Phase 4で切り替えた本番環境を監視しつつ、GitHub Actionsからjong-poiだけを安全にデプロイできる経路を追加する。

## CDの権限設計

- VPSにはパスワードを持たない`deploy`ユーザーを作る。
- `deploy`を`docker`、`sudo`グループへ追加しない。Dockerソケットへの直接アクセスはroot相当のため許可しない。
- GitHub Actions用公開鍵にはSSHの強制コマンドと`restrict`を設定する。
- 強制コマンドは`deploy <40文字コミットSHA>`以外を拒否する。
- `sudoers`で許可するのは、root所有の`/usr/local/sbin/jong-poi-deploy-root`だけとする。
- rootコマンドは入力を再検証し、`/opt/apps/jong-poi/ops/deploy.sh`だけを排他実行する。
- gatewayや他アプリを通常デプロイの対象に含めない。

## GitHub Actions

`Deploy production`は次の場合だけ候補リリースを作る。

1. `main`へのpushで`CI`が成功した場合
2. 公開済みの40文字SHAを手動指定した場合

ジョブはGitHub Environmentの`production`を使用する。初期運用では必須レビュー担当者を設定し、承認後だけEnvironmentのSecretへアクセスさせる。

### production Environment

Variables:

- `VPS_HOST`: VPSのホスト名またはIPアドレス
- `VPS_PORT`: 通常は`22`
- `VPS_USER`: `deploy`

Secrets:

- `VPS_SSH_KEY`: CD専用Ed25519秘密鍵
- `VPS_KNOWN_HOSTS`: 事前検証したVPSホスト公開鍵

## VPSへの導入

rootで、CD専用公開鍵を指定して次を実行する。

```bash
/opt/apps/jong-poi/ops/install-deploy-access.sh /path/to/deploy-key.pub
```

導入後は次を確認する。

1. `deploy <SHA>`以外のSSH命令が拒否される。
2. PTY、ポート転送、SSHエージェント転送が使用できない。
3. `deploy`が`sudo`または`docker`グループに所属していない。
4. 対象SHAのデプロイとバックアップ、ヘルスチェックが成功する。
5. gatewayと他アプリのコンテナが再作成されない。

## root SSHについて

CDではroot SSH鍵を使わない。当面は既存の`ssh genki`を維持し、rootは公開鍵認証だけを許可する`PermitRootLogin prohibit-password`へ制限する。既存の管理用root鍵は、別の管理ユーザーと緊急時手順を用意して接続試験を行うまで削除しない。`PermitRootLogin no`への変更は、別セッションから代替管理経路を確認したうえで実施する。

## 安定化期間

- app、queue、web、db、gatewayの再起動回数とログを確認する。
- CPU、メモリ、swap、ディスク使用量を確認する。
- `/up`、ログイン画面、公開ストレージ、TLS証明書を確認する。
- バックアップと復元試験を定期実行する。
- 旧コンテナと旧ファイルは保持期限を決め、削除時に改めて承認を得る。
