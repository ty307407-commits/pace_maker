'use client';

import { LanguageProvider } from '../context/LanguageContext';
import { GoalProvider } from '../context/GoalContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <GoalProvider>
                {children}
            </GoalProvider>
        </LanguageProvider>
    );
}
