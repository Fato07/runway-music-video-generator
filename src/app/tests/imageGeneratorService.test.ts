import { generateSceneImage, GenerateSceneImageOptions } from '../services/imageGeneratorService';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

describe('imageGeneratorService', () => {
  const mockOptions: GenerateSceneImageOptions = {
    quality: 'high',
    resolution: '1024x1024',
    theme: 'realistic'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully generate an image', async () => {
    const mockImageUrl = 'https://example.com/image.jpg';
    const mockResponse = {
      data: [{ url: mockImageUrl }]
    };

    (OpenAI as jest.Mock).mockImplementation(() => ({
      images: {
        generate: jest.fn().mockResolvedValue(mockResponse)
      }
    }));

    const result = await generateSceneImage('A beautiful sunset', mockOptions);
    expect(result).toBe(mockImageUrl);
  });

  it('should throw an error when no image URL is returned', async () => {
    const mockResponse = {
      data: [{ url: null }]
    };

    (OpenAI as jest.Mock).mockImplementation(() => ({
      images: {
        generate: jest.fn().mockResolvedValue(mockResponse)
      }
    }));

    await expect(generateSceneImage('A beautiful sunset', mockOptions))
      .rejects
      .toThrow('No image URL returned from the API');
  });

  it('should throw an error when API call fails', async () => {
    const mockError = new Error('API Error');

    (OpenAI as jest.Mock).mockImplementation(() => ({
      images: {
        generate: jest.fn().mockRejectedValue(mockError)
      }
    }));

    await expect(generateSceneImage('A beautiful sunset', mockOptions))
      .rejects
      .toThrow('API Error');
  });
});
