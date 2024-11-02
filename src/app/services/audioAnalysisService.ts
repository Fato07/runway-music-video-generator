import { exec } from 'child_process';

function executePythonScript(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      // console.log(`stdout: ${stdout}`);
      // console.error(`stderr: ${stderr}`);
      if (error) {
        reject(new Error(stderr.trim()));
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch (parseError) {
          reject(new Error(`Failed to parse JSON: ${stdout.trim()}`));
        }
      }
    });
  });
}

/**
 * Detects beats in an audio file using a Python script.
 * @param {string} filePath - The path to the audio file.
 * @returns {Promise<number[]>} - A promise that resolves to an array of beat times.
 */
export function detectBeats(filePath: string): Promise<number[]> {
  return executePythonScript(`/Users/fathindosunmu/DEV/MyProjects/runway-music-video-generator/python-scripts/.venv/bin/python python-scripts/audio_analysis.py beats ${filePath}`)
    .then(result => {
      if (result && Array.isArray(result.beats)) {
        return result.beats.map(Number);
      }
      throw new Error('Unexpected result format for beats');
    });
}
/**
 * Analyzes the tempo of an audio file using a Python script.
 * @param {string} filePath - The path to the audio file.
 * @returns {Promise<number>} - A promise that resolves to the tempo in beats per minute (BPM).
 */
export function analyzeTempo(filePath: string): Promise<number> {
  return executePythonScript(`/Users/fathindosunmu/DEV/MyProjects/runway-music-video-generator/python-scripts/.venv/bin/python python-scripts/audio_analysis.py tempo ${filePath}`)
    .then(result => {
      if (result && typeof result.tempo === 'number') {
        return result.tempo;
      }
      throw new Error('Unexpected result format for tempo');
    });
}

/**
 * Extracts the mood from a text using a Python script.
 * @param {string} text - The text to analyze.
 * @returns {Promise<number>} - A promise that resolves to a mood score.
 */
export function extractMood(text: string): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!text) {
      reject(new Error("Invalid text input"));
      return;
    }
    exec(`python python-scripts/audio_analysis.py mood "${text}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(parseFloat(stdout.trim()));
      }
    });
  });
}

/**
 * Segments an audio file using a Python script.
 * @param {string} filePath - The path to the audio file.
 * @returns {Promise<any>} - A promise that resolves to the audio segments.
 */
export function segmentAudio(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
      exec(`python python-scripts/audio_analysis.py segment ${filePath}`, (error, stdout, stderr) => {
          if (error) {
              console.error(`Error: ${error.message}`);
              reject(error);
              return;
          }
          if (stderr) {
              console.error(`Stderr: ${stderr}`);
              reject(new Error(stderr));
              return;
          }
          try {
              const segments = JSON.parse(stdout);
              resolve(segments);
          } catch (parseError) {
              console.error(`Error parsing JSON: ${parseError.message}`);
              reject(parseError);
          }
      });
  });
}



interface AudioAnalysisResult {
  beats: number[];
  tempo: number;
  mood: string;
  segments: any[];
}

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
