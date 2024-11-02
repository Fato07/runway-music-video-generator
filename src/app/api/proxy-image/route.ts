import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const imageUrl = request.nextUrl.searchParams.get('url');
        
        if (!imageUrl) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/png',
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('Proxy image error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to proxy image' },
            { status: 500 }
        );
    }
}
