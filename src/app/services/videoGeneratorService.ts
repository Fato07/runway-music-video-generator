import { downloadFile } from '@/utils/fileUtils';
import RunwayML from '@runwayml/sdk';

interface VideoGenerationOptions {
    motionIntensity: 'subtle' | 'moderate' | 'strong';
    duration: number;
    mood: string;
    tempo: number;
    transitionStyle?: string;
}

function createVideoPrompt(options: VideoGenerationOptions): string {
    const moodToMotion: Record<string, string> = {
        'energetic': 'dynamic camera movement, quick transitions',
        'calm': 'smooth, gentle camera movement',
        'mysterious': 'slow, ethereal camera movement',
        'dramatic': 'sweeping camera movements, dramatic zooms'
    };

    const tempoToTiming = (tempo: number): string => {
        if (tempo > 140) return 'rapid, quick cuts';
        if (tempo > 100) return 'moderate pacing';
        return 'slow, deliberate movement';
    };

    return `
        Create a cinematic sequence with ${moodToMotion[options.mood] || 'natural camera movement'}.
        ${tempoToTiming(options.tempo)}.
        Motion: ${options.motionIntensity} intensity.
        ${options.transitionStyle ? `Transition style: ${options.transitionStyle}.` : ''}
        Maintain consistent lighting and atmosphere throughout the sequence.
        Create a seamless loop that matches the musical tempo of ${options.tempo} BPM.
    `.trim();
}

export async function generateVideo(
    mainImage: string,
    variations: string[],
    beats: number[],
    options: VideoGenerationOptions
): Promise<string> {
    const client = new RunwayML({
        apiKey: process.env.RUNWAYML_API_KEY as string
    });

    try {
        // Generate video from main image
        const mainVideoTask = await client.imageToVideo.create({
            model: 'gen3a_turbo',
            duration: 10,
            promptImage: mainImage,
            promptText: createVideoPrompt(options),
            watermark: false
        });

        // Poll for completion
        let task;
        do {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
            task = await client.tasks.retrieve(mainVideoTask.id);
        } while (task.status === 'RUNNING');

        if (task.status === 'FAILED') {
            throw new Error(`Video generation failed: ${task.failure || task.failureCode}`);
        }

        if (!task.output || task.output.length === 0) {
            throw new Error('No video output received');
        }

        // Download and store the video
        const videoPath = await downloadFile(task.output[0], `music-video-${Date.now()}.mp4`);
        
        return videoPath;
    } catch (error) {
        console.error('Error in video generation:', error);
        throw error;
    }
}
