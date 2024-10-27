import { exec } from 'child_process';

/**
 * Detects beats in an audio file using a Python script.
 * @param {string} filePath - The path to the audio file.
 * @returns {Promise<number[]>} - A promise that resolves to an array of beat times.
 */
export function detectBeats(filePath: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    exec(`python3 python-scripts/audio_analysis.py beats ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(stdout));
      }
    });
  });
}

/**
 * Analyzes the tempo of an audio file using a Python script.
 * @param {string} filePath - The path to the audio file.
 * @returns {Promise<number>} - A promise that resolves to the tempo in beats per minute (BPM).
 */
export function analyzeTempo(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    exec(`python3 python-scripts/audio_analysis.py tempo ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(parseFloat(stdout));
      }
    });
  });
}

/**
 * Extracts the mood from a text using a Python script.
 * @param {string} text - The text to analyze.
 * @returns {Promise<number>} - A promise that resolves to a mood score.
 */
export function extractMood(text: string): Promise<number> {
  return new Promise((resolve, reject) => {
    exec(`python3 python-scripts/audio_analysis.py mood "${text}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(parseFloat(stdout));
      }
    });
  });
}
