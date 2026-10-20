import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';

const translations = { en, hi, mr };

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('lsr_lang') || 'en';
  });

  const setLanguage = (newLang) => {
    if (translations[newLang]) {
      setLangState(newLang);
      localStorage.setItem('lsr_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Translate helper supporting nested keys and dynamic placeholders
  const t = (keyPath, params = {}) => {
    const keys = keyPath.split('.');
    let current = translations[lang];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if key is missing in chosen language
        let fallback = translations.en;
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return keyPath; // If completely missing, return key path
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current === 'string') {
      let result = current;
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      });
      return result;
    }

    return current || keyPath;
  };

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t, supportedLangs: ['en', 'hi', 'mr'] }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
