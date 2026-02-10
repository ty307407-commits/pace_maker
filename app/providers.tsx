'use client';

import { LanguageProvider } from '../context/LanguageContext';
import { GoalProvider } from '../context/GoalContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

function AuthLoadingGuard({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0B15]">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthLoadingGuard>
                <LanguageProvider>
                    <GoalProvider>
                        {children}
                    </GoalProvider>
                </LanguageProvider>
            </AuthLoadingGuard>
        </AuthProvider>
    );
}
