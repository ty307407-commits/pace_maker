'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Auth callback error:', error);
                router.push('/login');
                return;
            }

            if (data.session) {
                router.push('/');
            } else {
                router.push('/login');
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-white">Authenticating...</div>
        </div>
    );
}
