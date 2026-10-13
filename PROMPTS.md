# PROMPTS.md — AI Feature: "Pahadi Mitra" Assistant Escalation

**Feature:** `POST /api/ai/assistant` (Week 7). The existing local rule-based chat
(`Frontend/src/utils/ai-engine.js`) answers known/common questions instantly. When it
has no specific match, the chat escalates the question to this endpoint, which calls
OpenAI's `gpt-4o-mini` model (via `Backend/services/openaiService.js`) for a real,
generated answer — grounded so it still sounds like part of Himalaya Connect rather
than a generic chatbot.

**System role used:** "Pahadi Mitra" — a warm, practical AI assistant for a platform
connecting Himalayan farmers/homestay owners with customers. The system prompt injects:
platform purpose, the 3 user types (farmer / homestay owner / customer) and what each
cares about, a short list of real product names and price ranges for grounding, and a
tone instruction (warm, concise, a little emoji, not corporate).

## Variation 1 — Bare, no grounding

**Prompt:**
```
You are a helpful assistant for an agriculture platform. Answer the user's question.
```
**Example input:** *"Why is Pahadi ghee so expensive compared to normal ghee?"*

**Output (summarised):** A generic, textbook answer about clarified butter production
costs in general — mentioned nothing about Himalaya Connect, A2 milk, or the region.
Technically correct but generic; felt like it could have come from any chatbot, and
didn't reference actual platform prices or reinforce why to buy through the platform.

**Verdict:** Rejected — too generic, no product/brand grounding, missed a chance to
reinforce trust in the direct-from-farmer model.

## Variation 2 — Role-aware, no product grounding

**Prompt:**
```
You are Pahadi Mitra, the AI assistant for Himalaya Connect. The user is a {role}.
Answer helpfully and mention relevant platform features where useful.
```
**Example input (role: farmer):** *"Why is Pahadi ghee so expensive compared to normal ghee?"*

**Output (summarised):** Better — correctly framed the answer around a farmer wanting
to justify premium pricing to buyers, and suggested "highlight your process to
customers". Still invented specific numbers that didn't match the platform's actual
listed price ranges, which risks contradicting what's shown elsewhere in the app.

**Verdict:** Closer, but ungrounded numbers are a real risk — an AI feature that
contradicts the product catalogue undermines trust more than a plain "I'm not sure."

## Variation 3 — Role-aware + grounded (final, used in production)

**Prompt (abridged — full text in `Backend/services/openaiService.js`):**
```
You are "Pahadi Mitra", the AI assistant for Himalaya Connect... [platform purpose,
the 3 user types and what each cares about]... Typical prices for context (₹): Kedarnath
Rajma ₹150/kg, Harsil Apple ₹160-220/kg, ... Pahadi Ghee ₹650-800/kg... Tone: warm,
practical, encouraging... Keep answers focused (roughly 80-150 words)... This user is a
FARMER on the platform.
```
**Example input (role: farmer):** *"Why is Pahadi ghee so expensive compared to normal ghee?"*

**Output (summarised):** Explained it's made from A2 milk of cows grazing on Himalayan
herbs, referenced the platform's actual ₹650-800/kg range instead of inventing a number,
and closed with a concrete suggestion — mention the grazing/feed story on the product
listing to justify the premium to customers. On the same question asked as a customer,
it instead explained the health/quality reasoning a buyer would care about, without the
seller-facing advice — showing the role-awareness working as intended.

**Why this one won:** It's the only version that (a) stayed on-brand and grounded in
real platform data instead of hallucinating numbers, (b) adapted the *content*, not just
the tone, based on who was asking, and (c) respected the length constraint so it renders
well in a chat bubble instead of a wall of text. This is the version wired into
`askAssistant()` in production.

## Notes on error handling

Three failure modes are handled explicitly (not just a generic "error"):
- **Not configured** (`OPENAI_API_KEY` missing) → 503 with a clear setup message.
- **Timeout** (>20s, via `AbortController`) → 504, "took too long, try again".
- **Rate-limited / quota** (OpenAI 429) → 429, "busy right now, try again shortly".

In every case, the frontend (`components/HimalayanAI/index.jsx`) shows a toast with the
specific reason and still displays the local rule-engine's generic fallback message in
the chat, so the user is never left staring at a spinner or a dead end.
