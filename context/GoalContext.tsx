'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Goal, Milestone, UserProfile } from '../lib/types';
import { MOCK_GOAL, MOCK_USER } from '../lib/mockData';
import { differenceInCalendarDays, format } from 'date-fns';

interface GoalContextProps {
    goal: Goal | null;
    userProfile: UserProfile | null;
    setGoal: (goal: Goal) => void;
    setUserProfile: (profile: UserProfile) => void;
    isLoading: boolean;
}

const GoalContext = createContext<GoalContextProps | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
    const [goal, setGoalState] = useState<Goal | null>(null);
    const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);



    // Load from localStorage on mount and check streak
    useEffect(() => {
        const savedGoal = localStorage.getItem('pace_maker_goal');
        const savedProfileStr = localStorage.getItem('pace_maker_profile');

        if (savedGoal) {
            setGoalState(JSON.parse(savedGoal));
        }

        if (savedProfileStr) {
            let profile: UserProfile = JSON.parse(savedProfileStr);
            const today = format(new Date(), 'yyyy-MM-dd');

            // Streak Logic
            if (profile.lastLoginDate !== today) {
                const lastLogin = profile.lastLoginDate ? new Date(profile.lastLoginDate) : new Date();
                const diff = differenceInCalendarDays(new Date(), lastLogin);

                if (diff === 1) {
                    // Consecutive day
                    profile.streak = (profile.streak || 0) + 1;
                } else if (diff > 1) {
                    // Broken streak
                    profile.streak = 1;
                } else {
                    // Same day (diff 0) - should be covered by first check but handling edge cases
                    // or if lastLoginDate was missing
                    if (!profile.streak) profile.streak = 1;
                }

                profile.lastLoginDate = today;

                // Update storage immediately
                localStorage.setItem('pace_maker_profile', JSON.stringify(profile));
            }

            setUserProfileState(profile);
        } else {
            setUserProfileState(null);
        }

        setIsLoading(false);
    }, []);

    const setGoal = (newGoal: Goal) => {
        setGoalState(newGoal);
        localStorage.setItem('pace_maker_goal', JSON.stringify(newGoal));
    };

    const setUserProfile = (profile: UserProfile) => {
        setUserProfileState(profile);
        localStorage.setItem('pace_maker_profile', JSON.stringify(profile));
    };

    return (
        <GoalContext.Provider value={{ goal, userProfile, setGoal, setUserProfile, isLoading }}>
            {children}
        </GoalContext.Provider>
    );
}

export function useGoal() {
    const context = useContext(GoalContext);
    if (context === undefined) {
        throw new Error('useGoal must be used within a GoalProvider');
    }
    return context;
}
