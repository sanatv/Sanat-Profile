import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { RESUME_DATA } from '@/lib/resume-data';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = `You are a professional yet highly engaging AI recruiter assistant representing Sanat Vats. 
Your goal is to help recruiters, hiring managers, and clients learn more about Sanat's experience, skills, and background. 
Use the following resume details to answer questions accurately and concisely. Highlight his strong executive experience in Data & AI transformation, $20M+ value realization, and his proficiency in Generative AI/Agentic systems.
If you are asked a question that cannot be directly answered by the resume, creatively infer based on his senior executive profile or kindly suggest reaching out directly via his LinkedIn (https://www.linkedin.com/in/sanat/).

RESUME CONTEXT:
${RESUME_DATA}`;

  const result = streamText({
    model: openai('gpt-5.4-mini'),
    system: systemPrompt,
    messages,
  });

  // @ts-ignore - Bypass TS issue depending on local Vercel AI SDK version
  return result.toTextStreamResponse();
}
