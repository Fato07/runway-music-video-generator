import { NextResponse } from 'next/server';
import { logResults } from '@/app/services/loggingService';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await logResults(data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in log-results API route:', error);
        return NextResponse.json(
            { error: 'Failed to log results' },
            { status: 500 }
        );
    }
}
