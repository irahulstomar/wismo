# WISMO

A "Where Is My Order?" support bot for e-commerce stores. A customer asks about their order in a storefront chat widget, the bot looks the order up, and replies with status, carrier, tracking link, and ETA, with a clean handoff to a human for anything it cannot answer.

> **Demo / portfolio project.** WISMO runs entirely on seeded sample data (fake US orders, `example.com` emails, no real carrier or store integrations). `seed.py` drops and recreates the database on each run so the demo stays reproducible. Live replies need a Gemini API key.

## The problem

"Where is my order?" is the single most common support ticket for online stores, and almost every one has the same answer sitting in the order record. Answering them by hand burns support time on a lookup a bot can do instantly. WISMO handles the repetitive status questions from a chat widget and escalates only the genuine exceptions to a human, so the support team spends its time where it actually matters.

## Key features

- **Storefront chat widget.** A customer-facing widget where shoppers ask about an order in natural language.
- **Grounded answers.** The bot looks the order up in the database and answers with real status, carrier, tracking link, and ETA. It answers from order data, not guesses.
- **Human handoff.** Anything the bot cannot confidently resolve is handed off cleanly to a human, with the conversation context preserved.
- **Support dashboard.** An agent-side view with an inbox of conversations, order details, order search, a knowledge base, and analytics.
- **Order journey view.** A visual rail showing where each order is in its lifecycle.
- **Seeded, reproducible demo.** Realistic fake orders across US carriers (USPS/UPS/FedEx) and statuses.

## Tech stack

**Backend** (`backend/requirements.txt`)
- Python + FastAPI, uvicorn
- Google Gemini (`google-genai`) for conversational replies
- Pydantic, python-dotenv
- SQLite for storage

**Frontend** (`frontend/package.json`)
- Next.js + React
- Tailwind CSS
- Motion (framer-motion), lucide-react
- TypeScript

## How it works

```
Input                      Processing                         Output
-----                      ----------                         ------
customer message      ─►   look up order in DB           ─►   grounded reply:
in chat widget             (status, carrier, ETA)              status + tracking + ETA
      │                          │
      │                    can the bot answer
      │                    confidently?
      │                     ┌────┴────┐
      │                    yes        no
      │                     │          │
      └─────────────────────┘     handoff to human
                                   (context preserved,
                                    shown in dashboard inbox)
```

## Run it locally

Requirements: Python 3.11+, Node 18+.

**1. Backend**

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # then add your Gemini key (see below)
python seed.py            # create and seed the demo database
uvicorn main:app --reload
```

Environment variables (`backend/.env`, see `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini API key for generating replies |

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 for the storefront with the chat widget, and http://localhost:3000/dashboard for the support agent view. The backend must be running for lookups and replies to work.

## Screenshots / Demo

<!-- Add a demo GIF or screenshots here. -->
_Demo GIF coming soon._
