interface Segment {
    description: string;
    start: number;
    end: number;
    mood: string;
}

interface MoodTransition {
    from: string;
    to: string;
    time: number;
}

interface SceneDescriptionInput {
    dominantMood: string;
    moodTransitions: MoodTransition[];
    tempo: number;
    beatCount: number;
    segments: Segment[];
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

export async function generateSceneDescription(input: SceneDescriptionInput): Promise<string> {
    try {
        // Create a more descriptive tempo characterization
        const tempoDescription = input.tempo > 120 ? "fast-paced" : 
                               input.tempo > 90 ? "moderate" : "slow and steady";
        
        // Format the mood transitions for the prompt
        const transitionDescriptions = input.moodTransitions
            .map(t => `${t.from} to ${t.to} at ${t.time.toFixed(2)}s`)
            .join(', ');

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
                        As a creative visionary, compose a vivid and imaginative scene description 
                        for an animated music video with the following musical characteristics:

                        - Overall tempo: ${tempoDescription} (${input.tempo} BPM)
                        - Dominant mood: ${input.dominantMood}
                        - Beat structure: ${input.beatCount} distinct beats
                        - Mood transitions: ${transitionDescriptions}

                        The scene should:
                        - Evoke strong imagery through sensory details (sight, sound, touch)
                        - Utilize metaphors or symbolism that align with the music's mood changes
                        - Reflect an artistic style reminiscent of surrealism
                        - Be approximately 150-200 words in length
                        - Include specific visual elements that can transition with the mood changes
                        
                        Please craft a captivating narrative that brings these musical elements to life visually.
                        `
                    }
                ],
                temperature: 0.7,
            })

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
