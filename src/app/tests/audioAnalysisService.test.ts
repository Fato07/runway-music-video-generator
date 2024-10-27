import { detectBeats, analyzeTempo, extractMood } from '../services/audioAnalysisService';
import path from 'path';

describe('audioAnalysisService', () => {
  const sampleAudioPath = path.resolve(__dirname, 'samples', 'sample.wav');
  const invalidAudioPath = path.resolve(__dirname, 'samples', 'invalid.txt');
  const sampleText = "I am feeling very happy today!";

  it('should detect beats in a valid audio file', async () => {
    jest.setTimeout(15000); // Set timeout to 15 seconds
    const beats = await detectBeats(sampleAudioPath);
    expect(Array.isArray(beats)).toBe(true);
    expect(beats.length).toBeGreaterThan(0);
  });

  it('should analyze tempo in a valid audio file', async () => {
    jest.setTimeout(15000); // Set timeout to 15 seconds
    const tempo = await analyzeTempo(sampleAudioPath);
    expect(typeof tempo).toBe('number');
    expect(tempo).toBeGreaterThan(0);
  });

  it('should extract mood from a text', async () => {
    const mood = await extractMood(sampleText);
    expect(typeof mood).toBe('number');
    expect(mood).toBeGreaterThan(0); // Assuming positive mood for happy text
  });

  it('should handle errors for invalid audio files', async () => {
    await expect(detectBeats(invalidAudioPath)).rejects.toThrow();
    await expect(analyzeTempo(invalidAudioPath)).rejects.toThrow();
  });

  it('should handle errors for invalid mood text', async () => {
    await expect(extractMood('')).rejects.toThrow();
  });
});
