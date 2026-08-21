# VPSセキュリティ更新記録（2026-08-21）

## 結果

SEC-09としてUbuntu 24.04の更新と計画再起動を実施した。更新、再起動、復元検査はすべて成功し、アプリデータの復旧作業は不要だった。

| 項目           | 更新前           | 更新後            |
| -------------- | ---------------- | ----------------- |
| Kernel         | 6.8.0-90-generic | 6.8.0-138-generic |
| Docker Engine  | 29.2.1           | 29.7.2            |
| Docker Compose | 5.1.0            | 5.5.0             |
| containerd     | 2.2.1            | 2.3.3             |

AppArmor、nftables、cloud-init、curl等を含む50パッケージを更新し、2パッケージを追加した。更新後の保留パッケージと再起動要求は0件である。`autoremove`、volume削除、Composeの`down`は実行していない。

## 更新前の保全

- 資格情報更新後のVPS内バックアップを作成した。
- 最新バックアップを隔離DBへ復元し、復元検査に成功した。
- GitHub Actions run `32377475303`で暗号化外部バックアップを保存した。
- `/var/backups/jong-poi-maintenance-20260820T140400Z`へ、rootだけが読めるOS設定とパッケージ状態のスナップショットを保存した。
- PR #25のmain CI、GHCR公開、本番デプロイrun `32377453273`が成功していることを確認した。

## 再起動後の検証

- boot IDが変更され、新kernelでSSHが復帰した。
- SSH設定、UFW、Fail2ban、AppArmor、Docker、containerd、時刻同期が正常だった。
- 外部TCP待受は22、80、443だけだった。
- gateway、app、queue、web、DBは同じコンテナIDを維持し、永続volumeも削除されていない。
- gateway、app、web、DBはhealthy、queueはrunningだった。
- appとqueueはUID/GID `33:33`で動作し、DB接続とmigration状態を確認できた。
- `/up`と`/login`はHTTPS 200だった。
- failed systemd unit、`failed_jobs`、直近30分のqueue ERRORはいずれも0件だった。
- backup timerとrestore-check timerはenabledかつactiveで、再起動後の復元検査も成功した。

起動直後、queueがDBのhealth確立前に開始して4件の接続エラーを記録した。Dockerのrestart policyで自動復旧しており、失敗ジョブとデータ欠損はなかった。queueの定期的な再起動は`--max-time=3600`による意図したworker再生成である。

boot journalのerror優先度には、Docker仮想NIC生成時のNTP IPv6 bind失敗と、公開SSHに対する外部スキャンの接続切断が記録されていた。時刻同期は完了し、Fail2banの`sshd` jailも稼働しているため、更新障害ではない。

## 次回の更新手順

1. VPS内バックアップ、隔離復元検査、暗号化外部バックアップを成功させる。
2. SSH、公開HTTPS、全コンテナ、UFW、Fail2banの更新前状態を記録する。
3. OS設定とパッケージ一覧をroot専用領域へ保存する。
4. `apt-get update`と`apt-get full-upgrade`を実行し、`dpkg --audit`と`apt-get check`を通す。
5. SSH設定とアプリhealthを確認してから計画再起動する。
6. 再起動後にkernel、更新残件、公開ポート、全サービス、DB接続、HTTPS、timer、復元検査を確認する。
7. 問題がある場合はアプリデータを上書きする前に原因を切り分け、保存した設定または検証済みバックアップから復旧する。
