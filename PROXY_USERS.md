# Proxy Users for Testing

Use these accounts to test **Flashcards** and **Progress** with pre-seeded data.

## Seed the database

From the project root (with server `.env` configured and MongoDB reachable):

```bash
npm run seed:proxy
```

This creates 3 users and fills their **Progress** with focus sessions over the last 14 days (so the Progress page shows real charts).

## Login credentials

| Email           | Password |
|----------------|----------|
| alice@test.com | Test123! |
| bob@test.com   | Test123! |
| carol@test.com | Test123! |

Use any of these on the login screen to test:

- **Progress** – View focus time by day and by subject (Mathematics, Physics, Biology, General).
- **Flashcards** – Add courses in Course Vault first, then open Flashcards, pick course + module, and generate with AI or manually.
