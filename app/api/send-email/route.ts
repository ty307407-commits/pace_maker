import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import PaceMakerEmail from '../../../lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email, username, goalTitle, message, progress } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            from: 'PaceMaker <onboarding@resend.dev>', // Free plan limitation: must use this sender
            to: [email],
            subject: `PaceMaker Update: ${goalTitle}`,
            react: PaceMakerEmail({
                username: username || 'Friend',
                goalTitle: goalTitle || 'Your Goal',
                message: message || "Keep pushing! You've got this.",
                progress: progress || 0,
            }),
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ message: 'Email sent successfully', data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
