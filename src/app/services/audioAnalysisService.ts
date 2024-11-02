export interface AudioAnalysisResult {
  beats: number[];
  tempo: number;
  mood: string;
  segments: Array<{
    start: number;
    end: number;
    mood: string;
    description: string;
  }>;
}

/**
 * Analyzes an audio file using the Flask server API.
 * @param {File} file - The audio file to analyze.
 * @returns {Promise<AudioAnalysisResult>} - A promise that resolves to the analysis results.
 */
export async function analyzeAudio(file: File): Promise<AudioAnalysisResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:5001/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Analysis failed: ${errorText}`);
    }

    const results = await response.json();
    console.log('Server response:', results);

    if (!results.beats || !results.tempo || !results.segments) {
      throw new Error('Invalid response format from server');
    }

    return {
      beats: results.beats,
      tempo: results.tempo,
      mood: results.segments[0]?.mood || 'neutral',
      segments: results.segments.map((segment: any) => ({
        start: segment.start,
        end: segment.end,
        mood: segment.mood,
        description: segment.description
      }))
    };
  } catch (error) {
    console.error('Error in analyzeAudio:', error);
    throw error;
  }
}
