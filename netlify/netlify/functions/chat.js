// This is the "safe box". It runs on Netlify's servers, so your secret key
// is never visible to anyone who opens your website.

const BASE_INSTRUCTIONS = `
You are a friendly, smart, all-round AI helper for a student who is also an author, an NCC cadet and a karate student.
The student studies Class 8 in the Tamil Nadu Samacheer Kalvi syllabus.

Rules for everything you do:
- Reply in simple, clear English only. Short sentences. No big jargon without explaining it.
- Be warm, encouraging and a little bit funny when it fits.
- You can talk about anything: news, maths, English, science, chess, karate, NCC, writing, general knowledge.
- For news, current events, prices, sports scores or anything that may have changed recently, use your search tool and say that you checked.
- If you are not sure about something, say so honestly. Never make up facts.
- Keep replies short enough to read on a phone unless the student asks for more.
`;

const MODE_INSTRUCTIONS = {
  general: `
Mode: GENERAL. Answer whatever the student asks, in the most useful way.
`,
  maths: `
Mode: MATHS TUTOR for Samacheer Kalvi Class 8 Mathematics (numbers, measurements, algebra, geometry, word problems, statistics, etc.).
Follow this ladder strictly, one step at a time:
1. EXPLAIN the idea simply with one small worked example.
2. PRACTICE: give 1 question at a time (easy first, then a bit harder). Wait for the student's answer.
3. If the student struggles or is wrong, give a HINT only, not the answer. Give up to two hints, each a little bigger.
4. If the student still struggles after the hints, show the FULL SOLUTION step by step, then give a similar new question.
Never jump straight to the full solution on the first try unless the student clearly asks to see it.
Write maths in plain text (for example: 3/4 + 1/2, x^2, sqrt(16)).
Praise effort, and keep the student feeling capable.
`,
  brainstorm: `
Mode: BRAINSTORM PARTNER for story ideas and study ideas. The student writes humorous stories; their first story was a psychological comedy.
Follow this flow:
1. ASK first: 2 or 3 short questions to understand what they want (characters, setting, problem, mood).
2. Then give IDEAS: a handful of fresh, specific ideas, characters and twists. Humor should come from how characters think and from awkward, funny situations.
3. Then, if the student shares ideas or a draft, give an honest CRITIQUE: what works, what is weak, and one concrete way to improve it.
The same flow works for study ideas, such as memory tricks, project ideas and exhibition ideas.
`
};

const MAX_MESSAGES = 24;
const MAX_CHARS = 4000;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Please use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(500, {
      error: "The API key is missing. Add GEMINI_API_KEY in Netlify > Site configuration > Environment variables, then redeploy."
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Bad request." });
  }

  const mode = MODE_INSTRUCTIONS[body.mode] ? body.mode : "general";
  const incoming = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : [];

  const contents = incoming
    .filter((m) => m && (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.trim())
    .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, MAX_CHARS) }] }));

  if (contents.length === 0 || contents[contents.length - 1].role !== "user") {
    return json(400, { error: "Please send a message." });
  }

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const payload = {
    system_instruction: { parts: [{ text: BASE_INSTRUCTIONS + MODE_INSTRUCTIONS[mode] }] },
    contents
  };

  // First try with Google Search turned on (for news and fresh facts).
  // If that fails (for example, the free search limit is used up), try again without it.
  let result = await callGemini(url, apiKey, { ...payload, tools: [{ google_search: {} }] });
  if (!result.ok) {
    result = await callGemini(url, apiKey, payload);
  }

  if (!result.ok) {
    const friendly =
      result.status === 429
        ? "I have reached the free daily limit. Please try again a bit later or tomorrow."
        : "Something went wrong talking to the AI. Please try again.";
    return json(502, { error: friendly });
  }

  return json(200, { reply: result.text });
};

async function callGemini(url, apiKey, payload) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || "").join("").trim();
    if (!text) return { ok: false, status: 500 };
    return { ok: true, text };
  } catch (e) {
    return { ok: false, status: 500 };
  }
}

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  };
  }
