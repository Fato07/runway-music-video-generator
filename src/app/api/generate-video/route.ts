import { NextRequest, NextResponse } from 'next/server';
import RunwayML from '@runwayml/sdk';

export async function POST(request: NextRequest) {
    try {
        const { mainImage, beats, options } = await request.json();

        const client = new RunwayML({
            apiKey: process.env.RUNWAYML_API_SECRET
        });

        const duration = (options.tempo > 120 || beats.length > 16) ? 5 : 10;

        const mainVideoTask = await client.imageToVideo.create({
            model: 'gen3a_turbo',
            promptImage: mainImage,
            duration,
            promptText: options.promptText,
            ratio: options.aspectRatio || '16:9',
            watermark: false
        });

        let task;
        let attempts = 0;
        const maxAttempts = 30;

        do {
            await new Promise(resolve => setTimeout(resolve, 2000));
            task = await client.tasks.retrieve(mainVideoTask.id);
            attempts++;

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

        return NextResponse.json({ videoUrl: task.output[0] });
    } catch (error) {
        console.error('Error in video generation API route:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate video' },
            { status: 500 }
        );
    }
}
