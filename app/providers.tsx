'use client';

import { LanguageProvider } from '../context/LanguageContext';
import { GoalProvider } from '../context/GoalContext';
import { AuthProvider } from '../context/AuthContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <GoalProvider>
                    {children}
                </GoalProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}
