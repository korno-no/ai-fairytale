import type { PlotChoice, StoryState } from '../types/story';

export const MAX_TURNS = 8;

export interface AIResponse {
  continuation: string;
  plotChoices?: PlotChoice[];
  /**
   * When true, indicates the story has reached a clear ending.
   */
  ending?: boolean;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Constructs a prompt from the story state and user input
 */
function buildPrompt(story: StoryState, userInput: string): string {
  const storyContext = story.turns
    .map((turn) => `${turn.author === 'user' ? 'User' : 'AI'}: ${turn.text}`)
    .join('\n\n');

  const totalTurnsSoFar = story.turns.length;
  const turnNumber = totalTurnsSoFar + 1;
  const turnsLeftAfterThis = Math.max(0, MAX_TURNS - turnNumber);
  const isLastTurn = turnsLeftAfterThis === 0;

  return `You are a creative storyteller. Continue an interactive fairy tale story.

Turn information:
- This is turn number: ${turnNumber} out of ${MAX_TURNS}
- Turns left after this response: ${turnsLeftAfterThis}

Current story:
${storyContext}

User's next input:
${userInput}

Respond with a JSON object containing:
{
  "continuation": "The next paragraph of the story (2-3 sentences)",
  "plotChoices": [
    {"id": "choice_1", "text": "First plot option"},
    {"id": "choice_2", "text": "Second plot option"},
    {"id": "choice_3", "text": "Third plot option"}
  ],
  "ending": true | false
}

Guidelines:
- The continuation should flow naturally from the story context
- The story must progress in every step.
- Avoid repeating events.
- Introduce resolution quickly.
- Suggest 3 plot choices for the user to pick from (optional, include only if appropriate and if the story is NOT ending yet)
- Keep the story engaging and coherent
- Maintain the fairy tale tone and atmosphere
- When only 2 steps remain, start resolving the story.
- When 1 step remains, finish the story completely.
${isLastTurn ? '- This IS the last step, you MUST end the story with a clear, satisfying ending in "continuation" and set "ending": true. Do NOT include any "plotChoices".' : '- If this is not the last step, keep the story open for continuation and set "ending": false (or omit it).'}

Return ONLY valid JSON, no markdown formatting.`;
}

/**
 * Sends story context to Gemini API via HTTP request and returns structured response
 */
export async function generateStoryResponse(
  story: StoryState,
  userInput: string,
): Promise<AIResponse> {
  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not configured');
  }

  try {
    const prompt = buildPrompt(story, userInput);

    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error ${response.status}: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No text content in Gemini response');
    }

    // Extract JSON from response (handles potential markdown formatting)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Validate and ensure plotChoices have proper IDs if provided
    if (parsedResponse.plotChoices && Array.isArray(parsedResponse.plotChoices)) {
      parsedResponse.plotChoices = parsedResponse.plotChoices.map(
        (choice: any, index: number) => ({
          id: choice.id || `choice_${Date.now()}_${index}`,
          text: choice.text || '',
        }),
      );
    }

    return {
      continuation: parsedResponse.continuation || '',
      plotChoices: parsedResponse.plotChoices,
      ending: typeof parsedResponse.ending === 'boolean' ? parsedResponse.ending : false,
    };
  } catch (error) {
    console.error('Error generating story response:', error);
    throw new Error(`Failed to generate story response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Alternative function for generating plot choices for an existing story turn
 */
export async function generatePlotChoices(
  story: StoryState,
  turnIndex: number,
): Promise<PlotChoice[]> {
  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not configured');
  }

  try {
    const storyContext = story.turns
      .slice(0, turnIndex + 1)
      .map((turn) => `${turn.author === 'user' ? 'User' : 'AI'}: ${turn.text}`)
      .join('\n\n');

    const prompt = `Based on this fairy tale story:

${storyContext}

Generate 3 interesting plot choices for what should happen next. Return ONLY a JSON array:
[
  {"id": "choice_1", "text": "First option"},
  {"id": "choice_2", "text": "Second option"},
  {"id": "choice_3", "text": "Third option"}
]`;

    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error ${response.status}: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No text content in Gemini response');
    }

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in Gemini response');
    }

    const parsedChoices = JSON.parse(jsonMatch[0]);

    return parsedChoices.map((choice: any, index: number) => ({
      id: choice.id || `choice_${Date.now()}_${index}`,
      text: choice.text || '',
    }));
  } catch (error) {
    console.error('Error generating plot choices:', error);
    throw new Error(`Failed to generate plot choices: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
