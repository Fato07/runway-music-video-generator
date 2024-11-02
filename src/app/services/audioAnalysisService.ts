

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
 * @param {string} audioUrl - The URL of the audio file to analyze.
 * @returns {Promise<AudioAnalysisResult>} - A promise that resolves to the analysis results.
 */
export async function analyzeAudio(audioUrl: string): Promise<AudioAnalysisResult> {
  try {
    const formData = new FormData();
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    formData.append('file', blob);

    const analysisResponse = await fetch('http://localhost:5001/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!analysisResponse.ok) {
      throw new Error('Failed to analyze audio');
    }

    const results = await analysisResponse.json();
    
    return {
      beats: results.beats,
      tempo: results.tempo,
      mood: results.segments[0]?.mood || 'neutral', // Use first segment's mood as overall mood
      segments: results.segments
    };
  } catch (error) {
    console.error('Error analyzing audio:', error);
    throw new Error('Failed to analyze audio file');
  }
}
