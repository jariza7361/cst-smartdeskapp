export function createI18n(lang = 'en') {
  let translations = {};
  let currentLang = lang;

  return {
    async init(language = 'en') {
      try {
        currentLang = language;
        const [en, es] = await Promise.all([
          fetch('/i18n/en.json')
            .then((r) => r.json())
            .catch(() => ({})),
          fetch('/i18n/es.json')
            .then((r) => r.json())
            .catch(() => ({})),
        ]);
        translations = { en, es };
        return true;
      } catch (error) {
        console.error('Failed to load translations:', error);
        translations = { en: {}, es: {} };
        return false;
      }
    },

    t(key, overrideLang) {
      const langToUse = overrideLang || currentLang;
      const langData = translations[langToUse] || translations.en || {};
      return langData[key] ?? key;
    },

    setLanguage(lang) {
      currentLang = lang;
    },
  };
}
