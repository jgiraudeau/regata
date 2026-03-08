import Anthropic from '@anthropic-ai/sdk';
import type { Zone, Course, Schedule, WindPoint, WavePoint, TideData, CurrentGrid, TacticalBriefing } from '@/types';
import { buildTacticalPrompt } from './prompts/tactical';

export async function generateBriefing(
  zone: Zone,
  course: Course,
  schedule: Schedule,
  wind: WindPoint[],
  waves: WavePoint[],
  tide: TideData,
  currents?: CurrentGrid
): Promise<TacticalBriefing> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Clé API Anthropic manquante sur le serveur (vérifiez les variables d'environnement Vercel).");
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = buildTacticalPrompt(zone, course, schedule, wind, waves, tide, currents);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  let jsonStr = '';

  // Extract JSON from <briefing> tags
  const briefingMatch = text.match(/<briefing>\s*([\s\S]*?)\s*<\/briefing>/);
  if (briefingMatch) {
    jsonStr = briefingMatch[1];
  } else {
    // Fallback: Claude a peut-être oublié les balises <briefing> mais mis du markdown json
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      jsonStr = markdownMatch[1];
    } else {
      // Fallback ulime: on cherche la présence d'accolades englobantes
      const bracesMatch = text.match(/(\{[\s\S]*\})/);
      if (bracesMatch) {
        jsonStr = bracesMatch[1];
      } else {
        console.error("=== RAW CLAUDE OUTPUT ===\n", text);
        throw new Error('Impossible de parser le briefing généré (Format inconnu)');
      }
    }
  }

  let briefing: TacticalBriefing;
  try {
    briefing = JSON.parse(jsonStr) as TacticalBriefing;
  } catch (err) {
    console.error("=== RAW CLAUDE OUTPUT ===\n", text);
    console.error("=== JSON EXTRAIT MAIS INVALIDE ===\n", jsonStr);
    throw new Error('Impossible de parser le briefing (JSON invalide)');
  }

  briefing.generatedAt = new Date().toISOString();

  return briefing;
}
