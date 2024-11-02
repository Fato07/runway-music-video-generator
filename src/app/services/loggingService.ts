import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Mark as server-side only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface AnalysisLog {
    timestamp: string;
    audioFileName: string;
    analysisResults: {
        beats: number[];
        tempo: number;
        segments: Array<{
            start: number;
            end: number;
            mood: string;
            description: string;
        }>;
    };
    scenePrompt: string;
    sceneDescription: string;
    imagePrompt: string;
    imageUrl: string;
    variations?: string[];
}

export async function logResults(log: AnalysisLog): Promise<void> {
    try {
        // Create results directory if it doesn't exist
        const resultsDir = path.join(process.cwd(), 'results');
        await mkdir(resultsDir, { recursive: true });

        // Create a timestamped folder for this analysis
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const analysisDir = path.join(resultsDir, `${timestamp}_${log.audioFileName}`);
        await mkdir(analysisDir, { recursive: true });

        // Write analysis results
        await writeFile(
            path.join(analysisDir, 'analysis.json'),
            JSON.stringify(log.analysisResults, null, 2)
        );

        // Write scene prompt and description
        await writeFile(
            path.join(analysisDir, 'scene.json'),
            JSON.stringify({
                prompt: log.scenePrompt,
                description: log.sceneDescription
            }, null, 2)
        );

        // Write image prompt
        await writeFile(
            path.join(analysisDir, 'image.json'),
            JSON.stringify({
                prompt: log.imagePrompt,
                url: log.imageUrl
            }, null, 2)
        );

        // Download and save the generated image
        const imageResponse = await fetch(log.imageUrl, {
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        await writeFile(
            path.join(analysisDir, 'generated-image.png'),
            imageBuffer
        );

        // Download and save variations if they exist
        if (log.variations) {
            const variationsDir = path.join(analysisDir, 'variations');
            await mkdir(variationsDir, { recursive: true });

            await Promise.all(log.variations.map(async (variationUrl, index) => {
                const variationResponse = await fetch(variationUrl, {
                    mode: 'cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
                const variationBuffer = Buffer.from(await variationResponse.arrayBuffer());
                await writeFile(
                    path.join(variationsDir, `variation-${index + 1}.png`),
                    variationBuffer
                );
            }));
        }

        console.log(`Results saved to: ${analysisDir}`);
    } catch (error) {
        console.error('Error logging results:', error);
        throw error;
    }
}
