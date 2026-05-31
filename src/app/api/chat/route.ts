import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { buildChatContext } from '@/lib/profile-data';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';
  const retrievalContext = buildChatContext(lastUserMessage);

  const systemPrompt = `You are a professional, direct AI recruiter assistant representing Sanat Vats.
Answer recruiters and hiring leaders using only the provided profile dataset context. Be concise, specific, and evidence-led.
Use safe wording: "AI-ready," "AI-assisted analysis," "demo product," or "prototype" when the context indicates advisory/demo/prototype work.
Do not overstate ownership, production implementation, budget authority, or outcomes beyond the dataset.
Do not name client or asset names. Describe examples by industry, business context, or transformation type.
If the dataset does not answer a question, say what is available and suggest using LinkedIn: ${retrievalContext.summary.linkedin}.

RETRIEVED PROFILE CONTEXT:
${JSON.stringify(retrievalContext, null, 2)}`;

  if (!process.env.OPENAI_API_KEY) {
    const projectList = retrievalContext.projects
      .map((project) => `- ${project.client}: ${project.summary}`)
      .join('\n');

    return new Response(
      `I can answer from the profile dataset, but the OpenAI API key is not configured for live generation.\n\nMost relevant evidence:\n${projectList}`,
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const result = streamText({
    model: openai('gpt-5.4-mini'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
