# ✦ Nova AI – Chatbot (FYP)

A modern AI chatbot web app with streaming replies, multiple chats, four assistant modes, Markdown/code rendering, and light/dark themes.

## Features
- Real-time streaming responses (with Stop button)
- Multiple conversations saved in `localStorage`
- Modes: General assistant, Study tutor, Code helper, Writing coach
- Copy and Regenerate actions
- Responsive, mobile-friendly UI with dark mode
- Secure backend proxy (API key never exposed to the browser)

## Tech stack
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Vercel Edge Function (`api/chat.js`)
- **AI:** Anthropic Claude API

## Project structure
```
nova-ai/
├── public/index.html   # UI + client logic
├── api/chat.js         # Serverless proxy to the Anthropic API
├── vercel.json
├── package.json
└── .env.example
```

## Run locally
```bash
npm i -g vercel
cp .env.example .env      # add your ANTHROPIC_API_KEY
vercel dev
```

## Deploy on Vercel
1. Push this folder to a GitHub repository.
2. On vercel.com choose **Add New → Project** and import the repo.
3. Under **Environment Variables** add `ANTHROPIC_API_KEY` (get one at console.anthropic.com).
4. Click **Deploy**.

## Security notes
- The API key lives only in Vercel environment variables.
- Server validates message count, length and roles.
- User/model text is HTML-escaped before rendering.
- Consider adding rate limiting (e.g. Upstash) before public launch.

## Future work (FYP 2)
User authentication, database-backed history, file upload, voice input, export chat, analytics.
