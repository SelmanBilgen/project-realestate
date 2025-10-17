import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to English
    return localStorage.getItem('language') || 'en';
  });

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Language options
  const languages = {
    en: {
      code: 'en',
      name: 'English',
      flag: '🇺🇸'
    },
    tr: {
      code: 'tr', 
      name: 'Türkçe',
      flag: '🇹🇷'
    },
    gr: {
      code: 'gr',
      name: 'Ελληνικά',
      flag: '🇬🇷'
    }
  };

  const value = {
    language,
    changeLanguage,
    languages,
    currentLanguage: languages[language] || languages.en
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};