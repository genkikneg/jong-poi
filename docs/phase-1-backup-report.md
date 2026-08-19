# Phase 1 バックアップ・復元確認記録

## 実施結果

本番移行計画のPhase 1「安全確保」を2026年8月19日に実施し、完了した。

本番サービスは停止せず、既存のDB、コンテナ、Compose、Nginx設定には変更を加えていない。

## 調査結果

| 項目 | 結果 |
| --- | --- |
| 本番DB | 18テーブル、約0.75MiB |
| 復元時に照合した行数 | 合計473行 |
| Laravel `FILESYSTEM_DISK` | `local` |
| コンテナ内 `storage/app` | 6ファイル、約2.7MiB |
| ホスト側Laravel `storage` | 11ファイル、約92KiB |
| VPSディスク | 99GiB中、約67GiB空き |
| VPSメモリ | 約1GiB、Swap 4GiB |

重要事項として、アプリが利用している約2.7MiBのファイルはLaravelコンテナ内に存在し、現在のComposeではホストへ永続化されていない。新構成へ移行する際は、今回退避した`application-storage.tar.gz`を永続ストレージへ復元する。

## バックアップ

VPS上の保存先：

```text
/var/backups/jong-poi/20260819_211337
```

保存先ディレクトリはモード`700`、各ファイルはモード`600`とした。

| ファイル | 内容 |
| --- | --- |
| `database.sql.gz` | MySQLの論理バックアップ |
| `database-counts.tsv` | 本番取得時のテーブル別行数 |
| `application-storage.tar.gz` | Laravelコンテナ内の`storage/app` |
| `host-storage.tar.gz` | VPS上のLaravel `storage` |
| `configuration.tar.gz` | `.env`、Compose、Nginx設定 |
| `image-info.txt` | Gitコミット、コンテナ、Dockerイメージ情報 |
| `manifest.txt` | バックアップファイル一覧とサイズ |
| `checksums.sha256` | SHA-256チェックサム |

`.env`を含むため、このディレクトリの内容を公開場所へコピーしたり、Gitへコミットしたりしてはならない。VPS外へ保存する場合は暗号化する。

## 検証結果

- 全ファイルのSHA-256チェックサム：成功
- SQL gzipの破損検査：成功
- storageアーカイブの読み取り検査：成功
- 設定アーカイブの読み取り検査：成功
- SQL内の`CREATE TABLE`：18件
- 記録したテーブル数：18件
- バックアップ権限：正常

## 復元試験

外部ネットワークへ接続せず、ホストポートも公開しない一時的な`mysql:8.0`コンテナを使用した。

検証内容：

1. 空のMySQLを初期化
2. `database.sql.gz`をインポート
3. 全18テーブルへ`CHECK TABLE`を実行
4. 全18テーブルの行数を本番取得時の記録と比較
5. 合計473行の一致を確認
6. 一時コンテナと一時ボリュームを削除

結果：

```text
restore=ok
table_checks=ok
tables_compared=18
rows_compared=473
```

## 完了確認

- 復元試験用コンテナが残っていないことを確認した。
- 本番のLaravel、Nginx、MySQLコンテナが継続稼働していることを確認した。
- `https://jong-poi.misoon.net`が従来どおりHTTP 302を返すことを確認した。
- 最終チェックサム検査に成功した。

## 残作業

今回のバックアップはVPS内にあるため、VPS自体の障害には対応できない。今後、次を追加する。

- 日次自動バックアップ
- 保存期間と世代管理
- 暗号化したVPS外バックアップ
- 定期的な復元試験

これらは新しい本番Compose構成とバックアップスクリプトを準備する段階で実装する。
