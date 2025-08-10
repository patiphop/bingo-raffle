# Known Issues & Limits

- Uses polling instead of WebSockets; expect 2–5s delay.
- No authentication for host endpoints in MVP. Add bearer token validation and hash storage to `Games` for production.
- Bingo card generator is simple random; does not guarantee balanced column ranges like traditional B-I-N-G-O.
- Rate limiting and CORS restrictions are not enforced in MVP.
- LINE Notify / Messaging are not wired; stubs can be added to send on winner/end events.
