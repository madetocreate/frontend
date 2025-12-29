## Share API (temp snapshot store)

- POST `/api/share` `{ snapshot: { threadId?, messageId?, messages: [{ role, text }] } }`
- GET `/api/share/[id]` returns `{ id, createdAt, expiresAt, snapshot }` or 404 if not found/expired.
- Storage: in-memory Map with 7 Tage TTL (v1).

