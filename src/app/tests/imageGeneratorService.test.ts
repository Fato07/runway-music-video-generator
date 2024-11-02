import 'openai/shims/node';
import { generateSceneImage, GenerateSceneImageOptions } from '../services/imageGeneratorService';
import OpenAI from 'openai';
import { createMock } from 'ts-auto-mock';

// Mock OpenAI
jest.mock('openai');

describe('imageGeneratorService', () => {
  const mockOptions: GenerateSceneImageOptions = {
    quality: 'high',
    resolution: '1024x1024',
    theme: 'realistic'
  };

  let openAIMock: jest.Mocked<OpenAI>;

  beforeEach(() => {
    openAIMock = createMock<OpenAI>();
    (OpenAI as jest.Mock).mockImplementation(() => openAIMock);
  });

  it('should successfully generate an image', async () => {
    const mockImageUrl = 'https://example.com/image.jpg';
    const mockResponse = {
      data: [{ url: mockImageUrl }]
    };

    openAIMock.images = {
      generate: jest.fn().mockResolvedValue(mockResponse)
    } as any;

    const result = await generateSceneImage('A beautiful sunset', mockOptions);
    expect(result).toBe(mockImageUrl);
    expect(openAIMock.images.generate).toHaveBeenCalledWith({
      model: "dall-e-3",
      prompt: 'A beautiful sunset',
      n: 5,
      size: "1024x1024",
    });
  });

  it('should throw an error when no image URL is returned', async () => {
    const mockResponse = {
      data: [{ url: null }]
    };

    openAIMock.images = {
      generate: jest.fn().mockResolvedValue(mockResponse)
    } as any;

    await expect(generateSceneImage('A beautiful sunset', mockOptions))
      .rejects
      .toThrow('No image URL returned from the API');
  });

  it('should throw an error when API call fails', async () => {
    const mockError = new Error('API Error');

    openAIMock.images = {
      generate: jest.fn().mockRejectedValue(mockError)
    } as any;

    await expect(generateSceneImage('A beautiful sunset', mockOptions))
      .rejects
      .toThrow('API Error');
  });
});
