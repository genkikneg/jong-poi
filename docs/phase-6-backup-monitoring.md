# Phase 6: 外部バックアップと監視

## 1. 完了条件

Phase 6は次を完了条件とする。

- VPS内で日次バックアップが実行される。
- VPS内の通常バックアップは14日間保存される。
- 毎週、隔離した一時MySQLコンテナへ復元し、テーブル数、行数、`CHECK TABLE`を検証する。
- 最新バックアップをVPS外へ毎日転送する。
- VPS外に保存する前にAES-256で暗号化する。
- 公開HTTPSの`/up`を15分間隔でVPS外から確認する。

## 2. 自動実行スケジュール

| 処理 | 実行元 | スケジュール | 保存期間 |
| --- | --- | --- | --- |
| DB、storage、構成バックアップ | VPS systemd | 毎日3:17以降 | 14日 |
| 最新バックアップの復元試験 | VPS systemd | 毎週日曜4:47以降 | ログはjournal |
| 暗号化済み外部バックアップ | GitHub Actions | 毎日4:17 | 30日 |
| 公開HTTPS監視 | GitHub Actions | 15分ごと | Actions実行履歴 |

systemdタイマーは同時起動を避けるため、最大15分のランダム遅延を設ける。

## 3. セキュリティ境界

外部バックアップはデプロイ用SSH鍵を再利用しない。`backup-export`専用のユーザーとSSH鍵を使用する。

専用ユーザーは次の制限を持つ。

- `sudo`グループと`docker`グループに所属しない。
- SSHのPTY、ポートフォワード、エージェントフォワードを禁止する。
- forced commandにより`backup-export`以外を拒否する。
- root権限では、検証済みの最新バックアップの出力だけを許可する。
- 12時間より古いバックアップは出力しない。

リポジトリはpublicのため、GitHub Actions artifactに平文バックアップを保存しない。SSH転送後、GitHubの一時runner上でGnuPGによるAES-256対称暗号化を行い、平文ファイルを削除してからartifactへ保存する。

## 4. GitHub設定

リポジトリに次のActions variablesを設定する。

- `BACKUP_VPS_HOST`
- `BACKUP_VPS_PORT`
- `BACKUP_VPS_USER=backup-export`

次のActions secretsを設定する。

- `BACKUP_SSH_KEY`
- `BACKUP_KNOWN_HOSTS`
- `BACKUP_PASSPHRASE`

`BACKUP_PASSPHRASE`はバックアップ復号に必要である。GitHub以外のパスワードマネージャーにも保存する。

## 5. タイマーの確認

```bash
systemctl list-timers --all \
  jong-poi-backup.timer \
  jong-poi-restore-check.timer

systemctl status jong-poi-backup.service
journalctl -u jong-poi-backup.service

systemctl status jong-poi-restore-check.service
journalctl -u jong-poi-restore-check.service
```

## 6. 外部バックアップの復号

GitHub Actionsからartifactをダウンロードし、まず暗号化ファイルのチェックサムを確認する。

```bash
sha256sum -c jong-poi-backup.tar.gz.gpg.sha256
gpg --output jong-poi-backup.tar.gz \
  --decrypt jong-poi-backup.tar.gz.gpg
tar -tzf jong-poi-backup.tar.gz
tar -xzf jong-poi-backup.tar.gz
```

展開後のバックアップディレクトリに対し、本番と分離したホストで次を実行する。

```bash
./ops/restore-check.sh /absolute/path/to/extracted-backup
```

## 7. 監視と通知

GitHub Actionsの`Production availability`が15分間隔で`https://jong-poi.misoon.net/up`を確認する。失敗の通知を受けるには、GitHubのNotification settingsでActionsのEmailまたはWeb通知を有効にする。

GitHubのscheduled workflowは高負荷時に遅延する可能性があり、public repositoryで60日間活動がない場合は自動的に無効化される。厳密なSLAが必要になった場合は、独立した専用監視サービスへ移行する。

## 8. 障害時の確認順序

1. `Production availability`の失敗ログを確認する。
2. VPSへ管理SSHで接続する。
3. `docker compose ps`でjong-poiだけを確認する。
4. gatewayとjong-poiのログを分けて確認する。
5. 復旧後に`/up`とログインページを確認する。

他アプリのComposeプロジェクトに対して`down`、`restart`、ボリューム削除を実行しない。
