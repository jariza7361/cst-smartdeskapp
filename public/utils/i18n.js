export async function createI18n(lang='en'){
  const [en, es] = await Promise.all([
    fetch('/i18n/en.json').then(r=>r.json()),
    fetch('/i18n/es.json').then(r=>r.json())
  ]);
  return {
    t(key, overrideLang){
      const L = (overrideLang || lang) === 'es' ? es : en;
      return L[key] ?? key;
    }
  };
}
