interface Segment {
    description: string;
    start: number;
    end: number;
    mood: string;
}

interface AnalysisResults {
    beats: number[];
    segments: Segment[];
    tempo: number;
}

interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    system_fingerprint: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        logprobs: null;
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        completion_tokens_details: {
            reasoning_tokens: number;
        };
    };
}

export async function generateSceneDescription(segment: Segment, tempo: number): Promise<string> {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'user',
                        content: `
                        As a creative visionary, you are to compose vivid and imaginative scene descriptions for an animated music video based on the audio segment below. The scene should:

                        - Evoke strong imagery through sensory details (sight, sound, touch)
                        - Utilize metaphors or symbolism that align with the music's mood
                        - Reflect an artistic style reminiscent of surrealism
                        - Be approximately 150-200 words in length

                        Audio Segment Details:
                        - Time Range: ${segment.start}s to ${segment.end}s
                        - Mood: ${segment.mood}
                        - Tempo: ${tempo} BPM
                        - Description: ${segment.description}

                        Please craft a captivating narrative that brings the music to life visually.
                        `
                    }
                ],
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data: ChatCompletionResponse = await response.json();
        
        if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
            throw new Error('Invalid response from OpenAI API');
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating scene description:', error);
        throw error;
    }
}