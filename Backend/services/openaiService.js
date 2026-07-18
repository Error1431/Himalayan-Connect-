const OpenAI = require('openai');

let client = null;
function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

const isAIConfigured = () => !!process.env.OPENAI_API_KEY;

// Compact, hand-written grounding context (rather than dumping the full
// 38KB knowledge-base file into every request) — keeps each call fast and
// cheap while still steering the model to answer like a Himalaya Connect
// expert instead of a generic chatbot.
const HIMALAYA_CONTEXT = `
You are "Pahadi Mitra", the AI assistant for Himalaya Connect — a platform that connects
Himalayan (Uttarakhand) farmers and homestay owners directly with customers, with no
middlemen. You help with three kinds of users:

- FARMERS: crop advice, seasonal calendars, value-addition ideas (e.g. turning raw
  mandua into brownies/bread), fair pricing, and connecting with buyers.
- HOMESTAY OWNERS: hosting tips, sourcing local organic ingredients, recipes using
  Himalayan produce, guest experience ideas.
- CUSTOMERS: understanding what makes Himalayan produce special (Gaazna Haldi, Lingda,
  Burans, Rotna, Arsa, Kafuli, Pahadi Ghee, Mandua, Jhangora, Gahat, red rice, walnuts,
  organic honey), health benefits, and how to buy direct from farmers on the platform.

Typical prices for context (₹): Kedarnath Rajma ₹150/kg, Harsil Apple ₹160-220/kg,
Mandua Flour ₹120/kg, Red Rice ₹180-220/kg, Organic Honey ₹450-600/kg, Pahadi Ghee
₹650-800/kg, Walnut ₹350/kg, homestays from ₹2,500/night.

Tone: warm, practical, encouraging — like a knowledgeable local friend, not a generic
corporate assistant. Keep answers focused and concise (roughly 80-150 words) unless the
user clearly wants a longer explanation. Use a couple of relevant emoji, not excessive.
If asked something totally unrelated to farming, homestays, Himalayan produce, or the
platform, answer briefly and steer back to how Himalaya Connect can help.
`.trim();

/**
 * Calls OpenAI to answer a question the local rule-based assistant
 * (Frontend/src/utils/ai-engine.js) didn't have a specific answer for.
 * Throws on failure — the caller (controller) is responsible for the
 * user-facing error handling / fallback.
 */
async function askAssistant({ message, role = 'user', history = [] }) {
  const openai = getClient();
  if (!openai) {
    const err = new Error('AI is not configured on this server (missing OPENAI_API_KEY).');
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  const roleContext = {
    farmer: 'This user is a FARMER on the platform.',
    homestay_owner: 'This user is a HOMESTAY OWNER on the platform.',
    homestay: 'This user is a HOMESTAY OWNER on the platform.',
    customer: 'This user is a CUSTOMER browsing the platform.',
    guest: 'This user has not logged in yet — gently mention that logging in unlocks personalised help.',
  }[role] || 'This user\'s role is unknown — answer generally.';

  const messages = [
    { role: 'system', content: `${HIMALAYA_CONTEXT}\n\n${roleContext}` },
    ...history.slice(-6).map((h) => ({ role: h.type === 'user' ? 'user' : 'assistant', content: h.text })),
    { role: 'user', content: message },
  ];

  // Guard against a hung request — OpenAI calls should come back in a
  // few seconds; if the network stalls, fail fast so the frontend can
  // show an error instead of spinning forever (Week 7: error handling).
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const completion = await openai.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.6,
        max_tokens: 400,
      },
      { signal: controller.signal }
    );

    const text = completion.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('AI returned an empty response');
    }
    return { text, model: completion.model };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { askAssistant, isAIConfigured };
