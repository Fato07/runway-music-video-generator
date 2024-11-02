'use client';

import { useState } from "react";
import AudioUpload from "@/components/AudioUpload";
import { generateSceneImage } from "./services/imageGeneratorService";

export default function Home() {
  const [analysisResults, setAnalysisResults] = useState<{
    beats: number[];
    tempo: number;
    mood: string;
    segments: any[];
  } | null>(null);

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = async (results: {
    beats: number[];
    tempo: number;
    mood: string;
    segments: any[];
  }) => {
    setAnalysisResults(results);
    
    try {
      setIsGenerating(true);
      setError(null);

      // Generate images for each segment
      const images = await Promise.all(
        results.segments.map((segment, index) => 
          generateSceneImage(
            `A ${results.mood} scene with tempo ${results.tempo}bpm: ${segment.description}`,
            {
              quality: "high",
              resolution: "1024x1024",
              theme: results.mood
            }
          )
        )
      );

      setGeneratedImages(images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate images');
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <AudioUpload onAnalysisComplete={handleAnalysisComplete} />
        
        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}

        {isGenerating && (
          <p className="mt-4">Generating scene images...</p>
        )}

        {generatedImages.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            {generatedImages.map((imageUrl, index) => (
              <img 
                key={index}
                src={imageUrl}
                alt={`Generated scene ${index + 1}`}
                className="w-full rounded-lg shadow-lg"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
