'use client';

import { useState } from "react";
import AudioUpload from "@/components/AudioUpload";
import { generateSceneImages } from "./services/imageGeneratorService";
import { generateSceneDescription } from "./services/sceneGeneratorService";

interface Segment {
    description: string;
    start: number;
    end: number;
    mood: string;
}

interface AnalysisResults {
    beats: number[];
    segments: Segment[];
    tempo: number;
}

export default function Home() {
    const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
    const [sceneDescription, setSceneDescription] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<string>('waiting'); // 'waiting' | 'analyzing' | 'generating-description' | 'generating-image'

    const handleAnalysisComplete = async (results: AnalysisResults) => {
        setAnalysisResults(results);
        setCurrentStep('generating-description');
        
        try {
            setIsGenerating(true);
            setError(null);

            // Take the first segment and generate a scene description
            if (results.segments.length === 0) {
                throw new Error('No segments found in analysis results');
            }

            const firstSegment = results.segments[0];
            
            // Generate scene description
            const description = await generateSceneDescription(
                firstSegment, 
                results.tempo
            );
            setSceneDescription(description);
            setCurrentStep('generating-image');

            // Generate image based on the scene description
            const imageUrl = await generateSceneImages(
                description,
                {
                    quality: "high",
                    resolution: "1024x1024",
                    theme: firstSegment.mood
                }
            );

            setGeneratedImage(imageUrl);
            setCurrentStep('complete');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate scene and image');
            console.error('Generation error:', err);
            setCurrentStep('error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-8">Music Video Scene Generator</h1>
                
                <AudioUpload onAnalysisComplete={handleAnalysisComplete} />
                
                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {isGenerating && (
                    <div className="mt-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                        <p className="mt-4 text-gray-600">
                            {currentStep === 'generating-description' && 'Creating scene description...'}
                            {currentStep === 'generating-image' && 'Generating visual representation...'}
                        </p>
                    </div>
                )}

                {sceneDescription && (
                    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Scene Description</h2>
                        <p className="text-gray-700 leading-relaxed">{sceneDescription}</p>
                    </div>
                )}

                {generatedImage && (
                    <div className="mt-8">
                        <div className="relative group max-w-2xl mx-auto">
                            <img 
                                src={generatedImage}
                                alt="Generated scene visualization"
                                className="w-full rounded-lg shadow-lg transition-transform duration-200 group-hover:scale-[1.02]"
                            />
                            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                                Generated Scene
                            </div>
                        </div>
                        
                        {analysisResults && (
                            <div className="mt-4 text-center text-sm text-gray-600">
                                <p>Tempo: {Math.round(analysisResults.tempo)} BPM</p>
                                <p>Mood: {analysisResults.segments[0]?.mood}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}