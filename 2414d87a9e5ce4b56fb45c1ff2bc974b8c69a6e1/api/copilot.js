export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  try {
    const { prompt } = await readJson(req);
    const key = process.env.OPENAI_API_KEY;

    // When no key is present, return local, rule-based output (zero-cost).
    if (!key) {
      const out = localCompose(prompt);
      return res.status(200).json(out);
    }

    // If you later add the real cloud call, keep this branch:
    // return await callOpenAI(key, prompt, res);

    // temporary OK (kept for safety)
    return res.status(200).json(localCompose(prompt));
  } catch {
    return res.status(400).json({ ok: false, error: 'Bad Request' });
  }
}

async function readJson(req) {
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (e) {
        reject(e);
      }
    });
  });
}

// -------- Local, rules-based composition (free) ----------
function localCompose(raw) {
  const txt = String(raw || '').toLowerCase();
  // crude signal extraction
  const wantsSSS = txt.includes('serve') || txt.includes('solve') || txt.includes('sell');
  const wantsFollowUp = /confirm|confirmation|follow.?up/.test(txt);

  const en = [
    wantsSSS
      ? 'Here\u2019s a concise Serve / Solve / Sell response:'
      : 'Here\u2019s a concise response:',
    '\u2022 Serve: Acknowledge and restate their need.',
    '\u2022 Solve: Provide exact steps, links, and any required verification.',
    '\u2022 Sell: Offer the best-fit plan/add-on only if it improves their outcome.',
    'Next steps: Please confirm this resolves your request or tell me what\u2019s missing.',
  ].join(' ');

  const es = [
    wantsSSS
      ? 'Aqu\u00ed tienes una respuesta breve de Servir / Resolver / Ofrecer:'
      : 'Aqu\u00ed tienes una respuesta breve:',
    '\u2022 Servir: reconocer y reformular la necesidad.',
    '\u2022 Resolver: indicar pasos exactos, enlaces y cualquier verificación requerida.',
    '\u2022 Ofrecer: proponer el plan o complemento adecuado solo si mejora el resultado.',
    'Pr\u00f3ximos pasos: confirma si esto resuelve tu solicitud o indica qu\u00e9 falta.',
  ].join(' ');

  // emphasize follow-up if asked
  return wantsFollowUp
    ? {
        en: en + ' I will follow up after your confirmation.',
        es: es + ' Har\u00e9 seguimiento despu\u00e9s de tu confirmaci\u00f3n.',
      }
    : { en, es };
}
