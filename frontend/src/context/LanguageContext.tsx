// @ts-nocheck
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';
import ta from '../locales/ta.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import bn from '../locales/bn.json';
import pa from '../locales/pa.json';
import or from '../locales/or.json';
import as from '../locales/as.json';

export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml' | 'mr' | 'gu' | 'bn' | 'pa' | 'or' | 'as';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const translations = { en, hi, te, ta, kn, ml, mr, gu, bn, pa, or, as };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Check localStorage first for guests
    const saved = localStorage.getItem('disasterguard_language') as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }

    // Try fetching from API if authenticated (assumes token is in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/language')
        .then(res => {
          if (res.data?.language && translations[res.data.language as Language]) {
            setLanguageState(res.data.language as Language);
            localStorage.setItem('disasterguard_language', res.data.language);
          }
        })
        .catch(err => console.error('Failed to load user language preference', err));
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('disasterguard_language', lang);
    
    // Sync with backend if logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.put('/auth/language', { language: lang })
        .catch(err => console.error('Failed to save language preference', err));
    }
  };

  const t = (path: string, variables?: Record<string, string>): string => {
    const keys = path.split('.');
    let current: any = translations[language];
    let found = true;
    
    for (const key of keys) {
      if (current === undefined || current[key] === undefined) {
        found = false;
        break;
      }
      current = current[key];
    }
    
    // Fallback to English
    if (!found) {
      current = translations['en'];
      for (const key of keys) {
        if (current === undefined || current[key] === undefined) return path; // Return key if missing in English too
        current = current[key];
      }
    }

    let result = String(current);
    if (variables) {
      Object.keys(variables).forEach(key => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
      });
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
