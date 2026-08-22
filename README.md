# jong-poi

ジャンポイ

## ローカル開発（Docker）

Docker Desktopを起動した状態で、プロジェクトルートから実行します。

### 起動

```bash
docker compose -f compose.local.yaml up -d
```

ブラウザで <http://localhost:8000> を開きます。ViteのHMRは`http://127.0.0.1:5173`、ローカルWebSocket（Reverb）は`ws://127.0.0.1:8080`で動作します。

スマートフォンなど別の端末から確認する場合は、`localhost`ではなく開発PCのIPアドレス（例: `http://192.168.1.10:8000`）でアクセスしてください。WebSocketも同じホスト名へ接続します。

### 状態確認

```bash
docker compose -f compose.local.yaml ps
```

### ログ確認

```bash
docker compose -f compose.local.yaml logs -f app vite
```

### 停止

```bash
docker compose -f compose.local.yaml down
```

ローカル開発では既存の`database/database.sqlite`を使用するため、現在のユーザーやセッションデータをそのまま引き継げます。
