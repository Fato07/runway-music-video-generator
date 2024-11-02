import fs from 'fs';
import path from 'path';

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
}

export async function logResults(log: AnalysisLog): Promise<void> {
    try {
        // Create results directory if it doesn't exist
        const resultsDir = path.join(process.cwd(), 'results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir);
        }

        // Create a timestamped folder for this analysis
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const analysisDir = path.join(resultsDir, `${timestamp}_${log.audioFileName}`);
        fs.mkdirSync(analysisDir);

        // Write analysis results
        fs.writeFileSync(
            path.join(analysisDir, 'analysis.json'),
            JSON.stringify(log.analysisResults, null, 2)
        );

        // Write scene prompt and description
        fs.writeFileSync(
            path.join(analysisDir, 'scene.json'),
            JSON.stringify({
                prompt: log.scenePrompt,
                description: log.sceneDescription
            }, null, 2)
        );

        // Write image prompt
        fs.writeFileSync(
            path.join(analysisDir, 'image.json'),
            JSON.stringify({
                prompt: log.imagePrompt,
                url: log.imageUrl
            }, null, 2)
        );

        // Download and save the generated image
        const imageResponse = await fetch(log.imageUrl);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        fs.writeFileSync(
            path.join(analysisDir, 'generated-image.png'),
            imageBuffer
        );

        console.log(`Results saved to: ${analysisDir}`);
    } catch (error) {
        console.error('Error logging results:', error);
        throw error;
    }
}
