# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## WhatsApp Chatbot Backend

**Feature**: AI-Powered WhatsApp Business Assistant

### Webhook Endpoints (under `/api`)

- `GET /api/webhook/whatsapp` — Meta webhook verification handshake
- `POST /api/webhook/whatsapp` — Receives incoming WhatsApp messages and sends automatic replies

### File Structure

```
artifacts/api-server/src/
  controllers/
    whatsappController.ts  — Handles verify + receive message HTTP logic
  services/
    whatsappService.ts     — Sends messages via WhatsApp Cloud API; chatbot reply logic
  routes/
    whatsapp.ts            — Mounts GET/POST webhook routes
```

### Environment Secrets Required

- `WHATSAPP_TOKEN` — Meta permanent access token
- `WHATSAPP_PHONE_NUMBER_ID` — WhatsApp Business phone number ID
- `WHATSAPP_VERIFY_TOKEN` — Secret token for webhook verification

### Chatbot Logic

Keywords handled (case-insensitive):
- `hi / hello / hey` → greeting
- `price / cost / rate` → pricing info
- `order` → order confirmation
- `help` → lists commands
- `thank` → polite response
- anything else → fallback with help hint

### To connect to Meta

1. Deploy this app (publish it) to get a public HTTPS URL
2. In Meta Developer Console → WhatsApp → Configuration → Webhook:
   - URL: `https://your-domain/api/webhook/whatsapp`
   - Verify Token: your `WHATSAPP_VERIFY_TOKEN` value
3. Subscribe to the `messages` field
4. Send a WhatsApp message to your test number — the bot will reply!

### Extending with AI

Replace or augment `getChatbotReply()` in `whatsappService.ts` with a call to Gemini or OpenAI to add full AI responses.
