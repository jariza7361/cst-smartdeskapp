// api/copilot.js — local builder for serve/solve/sell denial response
export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });
  try{
    const { prompt='', reason='', lang='en', bilingual=false, agent='Agent' } = req.body || {};
    const input = (reason || prompt || '').toLowerCase();

    const packs = {
      "no airtime": {
        en: { reason:"We found no airtime—no calls, texts, or data—since enrollment. Coverage requires usage after enrollment.",
              rebuttal:"Airtime after enrollment confirms the device was in working order. Your carrier can review alternatives." },
        es: { reason:"No se encontró uso (llamadas, mensajes o datos) desde la inscripción. La cobertura requiere uso posterior a la inscripción.",
              rebuttal:"El uso posterior confirma que el equipo funcionaba correctamente. Su proveedor puede revisar alternativas." }
      },
      "not enrolled": {
        en: { reason:"Your number isn’t enrolled in a protection plan, so we can’t approve the claim.",
              rebuttal:"If you think there’s been an error, your carrier can verify why coverage wasn’t added and review options." },
        es: { reason:"Su número no está inscrito en un plan de protección, por lo que no podemos aprobar la reclamación.",
              rebuttal:"Si cree que hubo un error, su proveedor puede verificar por qué no se agregó la cobertura y revisar opciones." }
      }
    };

    let key = "no airtime";
    if (input.includes('enroll')) key = "not enrolled";
    const pack = packs[key];

    const now = new Date(); const h=now.getHours();
    const greet = h<12? 'Good morning' : h<18? 'Good afternoon' : 'Good evening';
    const head = `${greet}, this is ${agent} with CST.`;

    let out = `SERVE: ${head}\n\nSOLVE: ${pack.en.reason}\n\nSELL: ${pack.en.rebuttal}`;
    if (bilingual) {
      out += `\n\n—\n\nSERVIR: ${head}\n\nRESOLVER: ${pack.es.reason}\n\nVALOR: ${pack.es.rebuttal}`;
    }
    return res.status(200).json({ ok:true, text: out });
  }catch(e){
    return res.status(500).json({ ok:false, error:String(e?.message||e) });
  }
}