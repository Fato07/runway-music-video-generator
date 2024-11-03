import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const { url, filename, analysisId } = await request.json();
        
        if (!url || !filename || !analysisId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Create a path within the results directory
        const resultsDir = path.join(process.cwd(), 'results', analysisId);
        await fs.mkdir(resultsDir, { recursive: true });

        const filePath = path.join(resultsDir, filename);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buffer));

        // Return the relative path
        const relativePath = `/results/${analysisId}/${filename}`;
        return NextResponse.json({ filePath: relativePath });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to download file' },
            { status: 500 }
        );
    }
}
