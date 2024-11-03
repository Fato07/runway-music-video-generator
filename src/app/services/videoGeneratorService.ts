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
    analysisFileName: string;  // Required to track which audio file this is for
}

function createVideoPrompt(options: VideoGenerationOptions): string {
    const moodToMovement = {
        'energetic': 'A rapid, dynamic flow with sweeping, bold camera angles and intense action',
        'calm': 'A gentle, floating movement with soft, tranquil transitions and serene atmosphere',
        'mysterious': 'A slow, deliberate dolly movement with shadowy, surreal elements and enigmatic lighting',
        'dramatic': 'A steady, cinematic push-in movement with rich, bold colors and intense lighting'
    };

    const tempoDescriptor = options.tempo > 140 
        ? 'swift and fluid'
        : options.tempo > 100 
            ? 'steady and rhythmic'
            : 'slow and measured';

    return `
        ${moodToMovement[options.mood as keyof typeof moodToMovement] || 'Smooth camera movement'} 
        with ${tempoDescriptor} motion.
        
        ${options.shouldLoop ? 'Create a seamless loop.' : 'Continuous, flowing transitions.'} 
        ${options.transitionStyle || 'Smooth, cinematic transitions.'}
        
        Emphasize cinematic lighting and composition, with ${options.motionIntensity || 'moderate'} motion intensity.
        Maintain a consistent ${options.mood} atmosphere throughout.
        No jarring camera shake or abrupt movements.
    `.trim();
}

function determineOptimalDuration(tempo: number, beats: number[]): 5 | 10 {
    return (tempo > 120 || beats.length > 16) ? 5 : 10;
}

async function validateImageForRunway(imageUrl: string): Promise<void> {
    try {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error('Failed to validate image');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.startsWith('image/')) {
            throw new Error('Invalid image format. Must be JPEG, PNG, or WebP.');
        }

        const contentLength = Number(response.headers.get('content-length'));
        if (contentLength > 16 * 1024 * 1024) {
            throw new Error('Image too large. Must be under 16MB.');
        }
    } catch (error) {
        console.error('Image validation error:', error);
        throw new Error('Failed to validate image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

async function downloadWithRetry(url: string, filename: string, analysisId: string, maxRetries = 3): Promise<string> {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await downloadFile(url, filename, analysisId);
        } catch (error) {
            lastError = error;
            console.error(`Download attempt ${i + 1} failed:`, error);
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        }
    }
    
    throw lastError;
}

export async function generateVideo(
    mainImage: string,
    beats: number[],
    options: VideoGenerationOptions
): Promise<string> {
    try {
        videoGenerationEvents.emit('progress', {
            status: 'validating',
            message: 'Validating input image...'
        });

        await validateImageForRunway(mainImage);

        const response = await fetch('/api/generate-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mainImage,
                // variations,
                beats,
                options: {
                    ...options,
                    promptText: createVideoPrompt(options)
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server error: ${response.status} - ${errorData.error}`);
        }

        const { videoUrl } = await response.json();

        return videoUrl;

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
