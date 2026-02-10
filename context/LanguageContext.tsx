'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language as LanguageType } from '../lib/i18n';

interface LanguageContextProps {
    language: LanguageType;
    setLanguage: (lang: LanguageType) => void;
    lang: string; // for HTML lang attribute
    t: any; // translation object
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<LanguageType>('ja');

    // Persist language preference
    useEffect(() => {
        const saved = localStorage.getItem('language') as LanguageType;
        if (saved) setLanguage(saved);
    }, []);

    const changeLanguage = (lang: LanguageType) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (keyStr: string) => {
        return keyStr.split('.').reduce((o, i) => (o as any)[i], translations[language]);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, lang: language, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
