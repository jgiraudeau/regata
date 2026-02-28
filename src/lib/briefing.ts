import Anthropic from '@anthropic-ai/sdk';
import type { Zone, Course, Schedule, WindPoint, WavePoint, TideData, CurrentGrid, TacticalBriefing } from '@/types';
import { buildTacticalPrompt } from './prompts/tactical';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateBriefing(
  zone: Zone,
  course: Course,
  schedule: Schedule,
  wind: WindPoint[],
  waves: WavePoint[],
  tide: TideData,
  currents?: CurrentGrid
): Promise<TacticalBriefing> {
  const prompt = buildTacticalPrompt(zone, course, schedule, wind, waves, tide, currents);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from <briefing> tags
  const briefingMatch = text.match(/<briefing>\s*([\s\S]*?)\s*<\/briefing>/);
  if (!briefingMatch) throw new Error('Impossible de parser le briefing généré');

  const briefing = JSON.parse(briefingMatch[1]) as TacticalBriefing;
  briefing.generatedAt = new Date().toISOString();

  return briefing;
}
