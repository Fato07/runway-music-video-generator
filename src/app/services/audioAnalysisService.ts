import { exec } from 'child_process';


function executePythonScript(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
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
  return executePythonScript(`python python-scripts/audio_analysis.py beats ${filePath}`)
    .then(result => {
      if (Array.isArray(result)) {
        return result.map(Number);
      }
      throw new Error('Unexpected result format');
    });
}
/**
 * Analyzes the tempo of an audio file using a Python script.
 * @param {string} filePath - The path to the audio file.
 * @returns {Promise<number>} - A promise that resolves to the tempo in beats per minute (BPM).
 */
export function analyzeTempo(filePath: string): Promise<number> {
  return executePythonScript(`python3 python-scripts/audio_analysis.py tempo ${filePath}`)
    .then(result => {
      const tempo = Number(result);
      if (isNaN(tempo)) {
        throw new Error('Invalid tempo value');
      }
      return tempo;
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
        resolve(parseFloat(stdout));
      }
    });
  });
}

