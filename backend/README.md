Express stub aligned with `frontend/src/services/backend-service.js`. Copy `.env.example` to `.env` and set `MONGODB_URI` to your Atlas cluster.

```bash
npm install
npm start
```

`GET /health` should return `{"ok":true}` when the server is up. Auth routes return `501` until you implement controllers with MongoDB.
