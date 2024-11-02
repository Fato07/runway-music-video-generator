export interface GenerateSceneImageOptions {
    quality: 'standard' | 'hd';
    resolution: '1024x1024' | '1792x1024' | '1024x1792';
    theme: string;
    tempo?: number;
    moodTransitions?: Array<{from: string, to: string, time: number}>;
}

/**
 * Generates variations of an image using DALL-E
 * @param {string} imageUrl - The URL of the original image
 * @returns {Promise<string[]>} - Array of variation image URLs
 */
async function generateImageVariations(imageUrl: string): Promise<string[]> {
    try {
        // Download the image first
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        const imageResponse = await fetch(proxyUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image through proxy: ${imageResponse.status}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();

        // Create form data with the image
        const formData = new FormData();
        formData.append('image', new Blob([imageBuffer], { type: 'image/png' }));
        formData.append('n', '4');
        formData.append('size', '1024x1024');

        // Make the variations request
        const response = await fetch('https://api.openai.com/v1/images/variations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data: DalleResponse = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('No variations returned from the API');
        }

        return data.data.map(image => image.url);
    } catch (error) {
        console.error('Error generating image variations:', error);
        throw error;
    }
}

interface DalleResponse {
    created: number;
    data: Array<{
        url: string;
    }>;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Creates an enhanced prompt that incorporates musical characteristics
 */
function createEnhancedPrompt(
    baseDescription: string, 
    options: GenerateSceneImageOptions
): string {
    const tempoDescription = options.tempo 
        ? options.tempo > 120 ? "dynamic and energetic"
        : options.tempo > 90 ? "balanced and flowing"
        : "calm and measured"
        : "";

    const moodStyle = options.theme === 'energetic'
        ? 'vibrant colors, dynamic composition, strong contrast'
        : 'soft colors, gentle transitions, subtle harmony';

    const transitionsDescription = options.moodTransitions?.length
        ? `The scene should smoothly transition between moods: ${
            options.moodTransitions
                .map(t => `from ${t.from} to ${t.to}`)
                .join(', ')
          }`
        : '';

    return `Create a visually striking scene with ${moodStyle}. 
    The overall mood is ${options.theme}, with a ${tempoDescription} atmosphere.
    ${transitionsDescription}
    
    Scene details: ${baseDescription}
    
    Important artistic elements:
    - Use color palette that reflects the ${options.theme} mood
    - Create visual flow that matches the musical rhythm
    - Include subtle visual metaphors for mood transitions
    - Maintain surrealist artistic style
    - Ensure high visual coherence and professional quality`;
}

/**
 * Generates scene images using DALL-E based on the provided scene description and musical characteristics.
 * @param {string} sceneDescription - The description of the scene to generate images for.
 * @param {GenerateSceneImageOptions} options - Options for adjusting quality, resolution, and musical context.
 * @returns {Promise<string>} - A promise that resolves to the generated image URL.
 */
export async function generateSceneImages(
    sceneDescription: string,
    options: GenerateSceneImageOptions
): Promise<{ imageUrl: string; prompt: string; variations?: string[] }> {
    try {
        const enhancedPrompt = createEnhancedPrompt(sceneDescription, options);
        console.log('Enhanced prompt:', enhancedPrompt); // For debugging

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: enhancedPrompt,
                n: 1,
                size: options.resolution,
                quality: options.quality,
                style: "vivid",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data: DalleResponse = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('No images returned from the API');
        }

        const imageUrl = data.data[0].url;
        
        // Generate variations
        const variations = await generateImageVariations(imageUrl);

        return {
            imageUrl,
            prompt: enhancedPrompt,
            variations
        };
    } catch (error) {
        console.error('Error generating scene images:', error);
        throw error;
    }
}
