import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

 export interface GenerateSceneImageOptions {
     quality: string;
     resolution: string;
     theme: string;
 }

 /**
  * Generates a scene image using DALL-E or Stable Diffusion based on the provided scene description.
  * @param {string} sceneDescription - The description of the scene to generate an image for.
  * @param {GenerateSceneImageOptions} options - Options for adjusting image quality, resolution, and theme.
  * @returns {Promise<string>} - A promise that resolves to the URL of the generated image.
  */
 export async function generateSceneImage(sceneDescription: string, options: GenerateSceneImageOptions): Promise<string> {
     try {

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: sceneDescription,
                n: 5,
                size: "1024x1024",
            });

         const imageUrl = response.data[0].url;
         if (!imageUrl) {
             throw new Error('No image URL returned from the API');
         }
         return imageUrl;
     } catch (error) {
         console.error('Error generating scene image:', error);
         throw error;
     }

}
