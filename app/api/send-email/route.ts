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
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">Hi ${username},</h1>
                <p>Here is your update for <strong>${goalTitle}</strong>.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-style: italic;">"${message}"</p>
                </div>

                <div style="margin-top: 20px;">
                  <strong>Current Progress: ${progress}%</strong>
                  <div style="width: 100%; background: #ddd; height: 10px; border-radius: 5px; margin-top: 5px;">
                    <div style="width: ${progress}%; background: #4F46E5; height: 100%; border-radius: 5px;"></div>
                  </div>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                  Keep moving forward! <br>
                  <a href="https://pace-maker-xi.vercel.app">Go to Dashboard</a>
                </p>
              </div>
            `
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ message: 'Email sent successfully', data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
