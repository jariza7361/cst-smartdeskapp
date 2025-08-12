// Vercel Serverless Function: POST /api/copilot
// Proxies to OpenAI Responses API with a bilingual system prompt.
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const key = process.env.OPENAI_API_KEY;
  if (!key) { res.status(500).json({ error: 'Missing OPENAI_API_KEY' }); return; }

  try {
    const { prompt } = await readJson(req);
    const sys = [
      "You are CST SmartDesk Copilot.",
      "Output MUST be safe for strict CSP (no external scripts).",
      "Return bilingual JSON with keys { en, es }.",
      "Never suggest document.write or inline event handlers."
    ].join(' ');

    const body = {
      model: process.env.OPENAI_MODEL || "o4-mini",
      input: [
        { role: "system", content: sys },
        { role: "user", content: prompt }
      ],
      // ensure JSON-ish output
      text_format: { type: "json_schema", json_schema: { name: "Bilingual", schema: { type:"object", properties:{ en:{type:"string"}, es:{type:"string"}}, required:["en","es"], additionalProperties:false } } }
    };

    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await r.json();
    if (!r.ok) { res.status(r.status).json({ error: data }); return; }

    // responses API returns { output: [...] } — pull first text block as JSON
    const first = (data.output && data.output[0] && data.output[0].content && data.output[0].content[0]) || null;
    const text = first?.type === 'output_text' ? first.text : JSON.stringify(first||{});
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { en: text, es: text }; }

    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function readJson(req){
  return new Promise((resolve, reject) => {
    let b=''; req.on('data', c=> b+=c); req.on('end', ()=> { try{ resolve(JSON.parse(b||'{}')); } catch(e){ reject(e); } });
  });
}
