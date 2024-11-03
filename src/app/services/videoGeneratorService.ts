import { downloadFile } from '@/utils/fileUtils';
import RunwayML from '@runwayml/sdk';

import { EventEmitter } from 'events';

export const videoGenerationEvents = new EventEmitter();

interface VideoGenerationOptions {
    mood: string;
    tempo: number;
    transitionStyle?: string;
    aspectRatio?: '16:9' | '9:16';
    shouldLoop?: boolean;
    motionIntensity?: 'strong' | 'moderate' | 'subtle';
    duration?: number;
}

function createVideoPrompt(options: VideoGenerationOptions): string {
    const moodToMovement = {
        'energetic': 'Smooth camera movement forward with dynamic flow',
        'calm': 'Gentle floating camera movement',
        'mysterious': 'Slow, deliberate dolly movement',
        'dramatic': 'Steady push-in camera movement'
    };

    const getTempoMovement = (tempo: number) => {
        if (tempo > 140) return 'with swift, fluid motion';
        if (tempo > 100) return 'with steady, continuous motion';
        return 'with graceful, measured motion';
    };

    return `
        ${moodToMovement[options.mood as keyof typeof moodToMovement] || 'Smooth camera movement'} 
        ${getTempoMovement(options.tempo)}.
        
        ${options.shouldLoop ? 'Create a seamless loop.' : 'Continuous fluid motion.'} 
        ${options.transitionStyle || 'Natural and smooth transitions.'}
        
        Cinematic lighting and composition.
        Maintain consistent atmosphere throughout.
        No camera shake or jerky movements.
    `.trim();
}

function determineOptimalDuration(tempo: number, beats: number[]): 5 | 10 {
    return (tempo > 120 || beats.length > 16) ? 5 : 10;
}

async function validateImageForRunway(imageUrl: string): Promise<void> {
    const response = await fetch(imageUrl);
    const contentType = response.headers.get('content-type');
    
    if (!contentType?.startsWith('image/')) {
        throw new Error('Invalid image format. Must be JPEG, PNG, or WebP.');
    }

    const contentLength = Number(response.headers.get('content-length'));
    if (contentLength > 16 * 1024 * 1024) {
        throw new Error('Image too large. Must be under 16MB.');
    }
}

async function downloadWithRetry(url: string, filename: string, maxRetries = 3): Promise<string> {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await downloadFile(url, filename);
        } catch (error) {
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
    
    throw lastError;
}

export async function generateVideo(
    mainImage: string,
    variations: string[],
    beats: number[],
    options: VideoGenerationOptions
): Promise<string> {
    try {
        videoGenerationEvents.emit('progress', {
            status: 'validating',
            message: 'Validating input image...'
        });

        await validateImageForRunway(mainImage);

        const client = new RunwayML({
            apiKey: process.env.RUNWAYML_API_KEY as string
        });

        const duration = determineOptimalDuration(options.tempo, beats);

        videoGenerationEvents.emit('progress', {
            status: 'generating',
            message: `Generating ${duration}s video...`
        });

        const mainVideoTask = await client.imageToVideo.create({
            model: 'gen3a_turbo',
            promptImage: mainImage,
            duration,
            promptText: createVideoPrompt(options),
            ratio: options.aspectRatio || '16:9',
            watermark: false
        });

        // Enhanced error handling during polling
        let task;
        let attempts = 0;
        const maxAttempts = 30; // 1 minute timeout
        
        do {
            await new Promise(resolve => setTimeout(resolve, 2000));
            task = await client.tasks.retrieve(mainVideoTask.id);
            attempts++;

            videoGenerationEvents.emit('progress', {
                status: 'processing',
                message: 'Processing video...',
                progress: Math.min(90, Math.floor((attempts / maxAttempts) * 100))
            });

            if (attempts >= maxAttempts) {
                throw new Error('Video generation timed out');
            }
        } while (task.status === 'RUNNING');

        if (task.status === 'FAILED') {
            throw new Error(`Video generation failed: ${task.failure || task.failureCode}`);
        }

        if (!task.output?.[0]) {
            throw new Error('No video output received');
        }

        videoGenerationEvents.emit('progress', {
            status: 'downloading',
            message: 'Downloading generated video...',
            progress: 95
        });

        const videoPath = await downloadWithRetry(task.output[0], `music-video-${Date.now()}.mp4`);

        videoGenerationEvents.emit('progress', {
            status: 'complete',
            message: 'Video generation complete',
            progress: 100
        });

        return videoPath;

    } catch (error) {
        videoGenerationEvents.emit('error', {
            message: error instanceof Error ? error.message : 'Unknown error during video generation'
        });
        
        console.error('Error in video generation:', error);
        throw new Error(
            error instanceof Error 
                ? `Video generation failed: ${error.message}`
                : 'Unknown error during video generation'
        );
    }
}
