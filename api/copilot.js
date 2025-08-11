// api/copilot.js
// Server-side Denials engine (Serve → Solve → Sell + optional Rebuttal)

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });

  const { type, code = '', carrier = '', bilingual = 'off', agent = 'Agent' } = req.body || {};
  if (type !== 'denial') return res.status(200).json({ text: 'OK (stub)' });

  const CARRIERS = { VZW:'Verizon', ATT:'AT&T', CRK:'Cricket' };
  const carrierName = CARRIERS[carrier?.toUpperCase()] || 'the carrier';

  const DENIALS_DB = {
    no_enrollment: {
      serve: "I understand how important this is. Thanks for your patience while I checked the account.",
      solve: "The mobile number isn’t enrolled in a protection plan, so a claim can’t be approved.",
      sell:  `Best next step: contact ${carrierName} to review enrollment options or alternate device solutions.`,
      rebuttal: "If you believe coverage should be active, the carrier can investigate why the plan wasn’t added."
    },
    no_ins_at_tol: {
      serve: "I can see why this is frustrating. I reviewed the coverage details closely.",
      solve: "Coverage was inactive on the incident date (time of loss), so we can’t approve the claim.",
      sell:  `Please contact ${carrierName} to verify coverage timelines or discuss replacement options.`
    },
    no_airtime: {
      serve: "Thanks for waiting while I verified usage on the line.",
      solve: "We did not find any airtime (calls/text/data) after enrollment to confirm active device use.",
      sell:  `To move forward, ${carrierName} can review recent usage and discuss alternatives if needed.`,
      rebuttal: "Airtime after enrollment helps verify the device is functioning and in use."
    },
    preexisting_damage: {
      serve: "I hear you—device issues are stressful. I checked the details.",
      solve: "The device had pre-existing damage or the incident occurred before insurance was added.",
      sell:  `Please check with ${carrierName} for available repair/upgrade options outside of the plan.`
    },
    active_imei_after_loss: {
      serve: "Thanks for your patience, I reviewed the activity on the line.",
      solve: "The device shows activity after the reported loss date, which conflicts with a loss/stolen claim.",
      sell:  `Have ${carrierName} suspend the line, block the device, and provide the last-usage date before refiling.`,
      rebuttal: "Once the correct last-usage date is confirmed, you can refile with accurate details."
    },
    model_not_in_use_at_tol: {
      serve: "I understand—let me share exactly what I found.",
      solve: "The claimed model does not match the device that was in use at the time of loss.",
      sell:  `Please confirm make/model/storage with ${carrierName} and refile with the enrolled device details.`,
      rebuttal: "This avoids repeat denials caused by model mismatches."
    },
    eopa: {
      serve: "I truly understand this is not the outcome you hoped for.",
      solve: "We found the plan wasn’t used as intended under the program’s Terms & Conditions (EOPA).",
      sell:  `For other options, ${carrierName} can review available device solutions or upgrades.`,
      rebuttal: "You can also review the published Terms & Conditions for clarity on eligible usage."
    }
  };

  const entry = DENIALS_DB[code] || {
    serve: "Thanks for your patience while I reviewed the details.",
    solve: "Here’s the plain‑English reason the claim was not approved.",
    sell:  `Next best step: check with ${carrierName} for alternatives or refile guidance.`
  };

  function greeting(){
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }
  const intro = `${greeting()}, this is ${agent} with CST.`;

  const en =
`${intro}

SERVE — ${entry.serve}
SOLVE — ${entry.solve}
SELL — ${entry.sell}${entry.rebuttal ? `

REBUTTAL — ${entry.rebuttal}` : ''}`;

  const ES_TRANSLATIONS = {
    serve: {
      no_enrollment: "Entiendo lo importante que es. Gracias por tu paciencia mientras revisé la cuenta.",
      no_ins_at_tol: "Entiendo que es frustrante. Revisé los detalles de la cobertura con cuidado.",
      no_airtime: "Gracias por esperar mientras verifiqué el uso de la línea.",
      preexisting_damage: "Te escucho—estas situaciones generan estrés. Revisé los detalles.",
      active_imei_after_loss: "Gracias por tu paciencia; verifiqué la actividad de la línea.",
      model_not_in_use_at_tol: "Entiendo; te comparto exactamente lo que encontré.",
      eopa: "Entiendo que no es el resultado que esperabas.",
      default: "Gracias por tu paciencia mientras revisé los detalles."
    },
    intro: (name)=> {
      const h = new Date().getHours();
      const g = h<12?'Buenos días':h<18?'Buenas tardes':'Buenas noches';
      return `${g}, te habla ${name} de CST.`;
    }
  };

  const solveES = {
    no_enrollment: "El número móvil no está inscrito en un plan de protección, por lo que no podemos aprobar la reclamación.",
    no_ins_at_tol: "La cobertura estaba inactiva en la fecha del incidente (momento de la pérdida).",
    no_airtime: "No encontramos tiempo de uso (llamadas/mensajes/datos) después de la inscripción para confirmar uso activo.",
    preexisting_damage: "El equipo tenía daño preexistente o el incidente ocurrió antes de agregar el seguro.",
    active_imei_after_loss: "Hay actividad del equipo después de la fecha reportada de pérdida, lo que entra en conflicto con una pérdida/robo.",
    model_not_in_use_at_tol: "El modelo reclamado no coincide con el equipo en uso al momento de la pérdida.",
    eopa: "Detectamos uso fuera de los Términos y Condiciones del programa (EOPA).",
    default: "Esta es la razón, en términos simples, por la cual no se aprobó la reclamación."
  };

  const sellES = {
    no_enrollment: `Siguiente paso: comunícate con ${carrierName} para revisar opciones de inscripción u otras soluciones.`,
    no_ins_at_tol: `Verifica las fechas de cobertura con ${carrierName} o consulta opciones de reemplazo.`,
    no_airtime: `Solicita a ${carrierName} revisar el uso reciente y ver alternativas si hace falta.`,
    preexisting_damage: `Consulta con ${carrierName} opciones de reparación o reemplazo fuera del plan.`,
    active_imei_after_loss: `Pide a ${carrierName} suspender la línea, bloquear el equipo y confirmar la última fecha de uso antes de volver a presentar.`,
    model_not_in_use_at_tol: `Confirma marca/modelo/almacenamiento con ${carrierName} y vuelve a presentar con los datos correctos.`,
    eopa: `Consulta con ${carrierName} opciones de equipo o actualización.`,
    default: `Siguiente paso: consulta con ${carrierName} alternativas o guía para volver a presentar.`
  };

  const rebES = {
    no_airtime: "El uso después de la inscripción ayuda a confirmar que el equipo funciona y está en uso.",
    active_imei_after_loss: "Con la última fecha de uso correcta, puedes volver a presentar con datos exactos."
  };

  const es =
`${ES_TRANSLATIONS.intro(agent)}

SERVIR — ${ES_TRANSLATIONS.serve[code] || ES_TRANSLATIONS.serve.default}
RESOLVER — ${solveES[code] || solveES.default}
ORIENTAR — ${sellES[code] || sellES.default}${rebES[code] ? `

REBATIR — ${rebES[code]}` : ''}`;

  const text = (bilingual === 'on') ? `${en}\n\n---\n\n${es}` : en;
  return res.status(200).json({ text });
}