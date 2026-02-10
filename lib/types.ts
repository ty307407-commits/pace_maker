
export type PersonalityType = 'STEADY' | 'SPRINTER' | 'PROCRASTINATOR';
export type GoalCategory = 'WORK' | 'STUDY' | 'HOBBY' | 'HEALTH' | 'FINANCE' | 'OTHER';

export interface UserProfile {
    name: string;
    personalityType: PersonalityType;
    pacingMultiplier: number; // 1.0 = linear, >1 = back-loaded (procrastinator), <1 = front-loaded (sprinter)
    notifications: { // New Notification preferences
        enabled: boolean;
        method: 'BROWSER' | 'EMAIL' | 'LINE' | 'NONE';
        time: string; // "09:00"
    };
    streak: number;
    lastLoginDate: string;
}

export interface Milestone {
    id: string;
    title: string;
    description?: string;
    targetDate: string; // ISO string
    completedDate?: string; // ISO string
    status: 'pending' | 'completed' | 'missed' | 'adjusted';
    difficulty: 'micro' | 'small' | 'medium' | 'large';
    progress: number; // 0-100
}

export interface Goal {
    id: string;
    title: string;
    category: GoalCategory;
    description: string;
    startDate: string;
    deadline: string;
    milestones: Milestone[];
    progress: number; // calculated from milestones
    color: string; // visual theme
}
