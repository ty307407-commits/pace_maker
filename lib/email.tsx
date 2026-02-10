import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface PaceMakerEmailProps {
    username: string;
    goalTitle: string;
    message: string;
    progress: number;
}

export const PaceMakerEmail = ({
    username = "Hero",
    goalTitle = "Master React",
    message = "You're doing great! Keep pushing forward.",
    progress = 50,
}: PaceMakerEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>PaceMaker Update: {goalTitle}</Preview>
            <Tailwind>
                <Body className="bg-slate-900 font-sans text-white">
                    <Container className="mx-auto my-[40px] max-w-[465px] rounded-2xl border border-slate-700 bg-slate-800 p-[20px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-[24px] font-bold text-center text-indigo-400 p-0 my-[30px] mx-0">
                                PaceMaker ⏱️
                            </Heading>
                        </Section>

                        <Heading className="text-[20px] font-normal text-center p-0 my-[30px] mx-0 text-white">
                            Hi <strong>{username}</strong>,
                        </Heading>

                        <Text className="text-[14px] leading-[24px] text-slate-300">
                            Here is your daily update for <strong>{goalTitle}</strong>.
                        </Text>

                        <Section className="my-[24px] p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                            <Text className="text-[16px] leading-[26px] text-yellow-300 font-medium m-0">
                                "{message}"
                            </Text>
                        </Section>

                        <Section className="my-[24px]">
                            <Text className="text-[12px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
                                Current Progress
                            </Text>
                            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <Text className="text-right text-[12px] text-slate-400 mt-1">
                                {progress}% Complete
                            </Text>
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Link
                                className="bg-indigo-600 rounded-full text-white px-8 py-4 font-bold no-underline hover:bg-indigo-500 transition-colors"
                                href="https://pace-maker-xi.vercel.app"
                            >
                                Check Dashboard
                            </Link>
                        </Section>

                        <Text className="text-center text-[12px] text-slate-500 mt-8">
                            Keep moving forward at your own pace.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default PaceMakerEmail;
