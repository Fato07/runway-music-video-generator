export interface GenerateSceneImageOptions {
    quality: string;
    resolution: string;
    theme: string;
}

interface DalleResponse {
    created: number;
    data: Array<{
        url: string;
    }>;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Generates scene images using DALL-E or Stable Diffusion based on the provided scene description.
 * @param {string} sceneDescription - The description of the scene to generate images for.
 * @param {GenerateSceneImageOptions} options - Options for adjusting image quality, resolution, and theme.
 * @returns {Promise<string[]>} - A promise that resolves to an array of image URLs.
 */
export async function generateSceneImages(sceneDescription: string, options?: GenerateSceneImageOptions): Promise<string> {
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: sceneDescription,
                n: 1,
                size: "1024x1024",
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

        return data.data[0].url;
    } catch (error) {
        console.error('Error generating scene images:', error);
        throw error;
    }
}