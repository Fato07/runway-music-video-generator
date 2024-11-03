export async function downloadFile(url: string, filename: string, analysisId: string): Promise<string> {
    if (!url || !filename || !analysisId) {
        throw new Error('Missing required parameters for file download');
    }

    const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            url, 
            filename,
            analysisId 
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download file');
    }

    const { filePath } = await response.json();
    return filePath;
}
