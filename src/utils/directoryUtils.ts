export function generateAnalysisDir(fileName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${timestamp}_${fileName}`;
}
