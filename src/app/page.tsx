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

// Add the analyzeMoodPatterns helper function
function analyzeMoodPatterns(segments: Segment[]) {
    // Count occurrences of each mood
    const moodCounts = segments.reduce((acc, segment) => {
        acc[segment.mood] = (acc[segment.mood] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Find the most common mood
    const dominantMood = Object.entries(moodCounts)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    // Identify mood transitions
    const transitions = segments.reduce((acc, segment, i, arr) => {
        if (i > 0 && segment.mood !== arr[i-1].mood) {
            acc.push({
                from: arr[i-1].mood,
                to: segment.mood,
                time: segment.start
            });
        }
        return acc;
    }, [] as Array<{from: string, to: string, time: number}>);

    return {
        dominantMood,
        transitions,
        moodCounts
    };
}

export default function Home() {
    const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
    const [sceneDescription, setSceneDescription] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imageVariations, setImageVariations] = useState<string[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<string>('waiting'); // 'waiting' | 'analyzing' | 'generating-description' | 'generating-image'
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

    const handleAnalysisComplete = async (results: AnalysisResults, fileName: string) => {
        setAnalysisResults(results);
        setCurrentStep('generating-description');
        
        try {
            setIsGenerating(true);
            setError(null);

            if (results.segments.length === 0) {
                throw new Error('No segments found in analysis results');
            }

            // Analyze mood patterns
            const moodPatterns = analyzeMoodPatterns(results.segments);
            
            // Generate comprehensive description using the new interface
            const description = await generateSceneDescription({
                dominantMood: moodPatterns.dominantMood,
                moodTransitions: moodPatterns.transitions,
                tempo: results.tempo,
                beatCount: results.beats.length,
                segments: results.segments
            });

            setSceneDescription(description);
            setCurrentStep('generating-image');

            // Generate image with enhanced context
            const { imageUrl, prompt: imagePrompt, variations } = await generateSceneImages(
                description,
                {
                    quality: "hd",
                    resolution: "1024x1024",
                    theme: moodPatterns.dominantMood,
                    tempo: results.tempo,
                    moodTransitions: moodPatterns.transitions
                }
            );

            setGeneratedImage(imageUrl);
            setImageVariations(variations || null);
            
            setCurrentStep('generating-video');
            setIsGeneratingVideo(true);
            
            // Calculate appropriate motion intensity based on mood and tempo
            const motionIntensity = (() => {
                if (results.tempo > 140 || moodPatterns.dominantMood === 'energetic') return 'strong';
                if (results.tempo > 90 || moodPatterns.dominantMood === 'dramatic') return 'moderate';
                return 'subtle';
            })();

            // Calculate optimal video duration based on tempo
            const duration = Math.min(4, Math.max(2, 60 / results.tempo * 4)); // 4 beats, max 4 seconds

            // Determine transition style based on mood
            const transitionStyle = moodPatterns.dominantMood === 'energetic' 
                ? 'quick dissolves and dynamic transitions'
                : 'smooth, gradual transitions';

            const videoPath = await generateVideo(
                imageUrl,
                variations || [],
                results.beats,
                {
                    motionIntensity,
                    duration,
                    mood: moodPatterns.dominantMood,
                    tempo: results.tempo,
                    transitionStyle
                }
            );
            
            setVideoUrl(videoPath);
            setCurrentStep('complete');
            setIsGeneratingVideo(false);

            // Log the results with the original filename through the API
            const logResponse = await fetch('/api/log-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    audioFileName: fileName,
                    analysisResults: results,
                    scenePrompt: description,
                    sceneDescription: description,
                    imagePrompt,
                    imageUrl
                })
            });

            if (!logResponse.ok) {
                throw new Error('Failed to log results');
            }
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
                        <div className="space-y-8">
                            <div className="relative group max-w-2xl mx-auto">
                                <img 
                                    src={generatedImage}
                                    alt="Generated scene visualization"
                                    className="w-full rounded-lg shadow-lg transition-transform duration-200 group-hover:scale-[1.02]"
                                />
                                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                                    Original Scene
                                </div>
                            </div>
                            
                            {/* Image Variations */}
                            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                                {imageVariations?.map((variationUrl, index) => (
                                    <div key={index} className="relative group">
                                        <img 
                                            src={variationUrl}
                                            alt={`Scene variation ${index + 1}`}
                                            className="w-full rounded-lg shadow-lg transition-transform duration-200 group-hover:scale-[1.02]"
                                        />
                                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                                            Variation {index + 1}
                                        </div>
                                    </div>
                                ))}
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

                {/* Video Result */}
                {videoUrl && (
                    <div className="mt-8 max-w-2xl mx-auto">
                        <h2 className="text-xl font-semibold mb-4">Generated Video</h2>
                        <video 
                            controls 
                            className="w-full rounded-lg shadow-lg"
                            src={videoUrl}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}

                {isGeneratingVideo && (
                    <div className="mt-8 max-w-2xl mx-auto">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                        <p className="mt-4 text-gray-600">
                            Generating video from scenes...
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
