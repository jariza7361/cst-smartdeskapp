export function buildPrompt(samplePrompt = '', userText = '', contextObj = null) {
  let parts = [];
  if (contextObj) {
    let ctx = typeof contextObj === 'string' ? contextObj : JSON.stringify(contextObj);
    parts.push('CONTEXT_JSON=' + ctx.slice(0, 3000));
  }
  if (samplePrompt) parts.push(samplePrompt.trim());
  if (userText) parts.push(userText.trim());
  return parts.join('\n\n').trim();
}
