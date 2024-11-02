'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { analyzeAudio } from '@/app/services/audioAnalysisService';

interface AudioUploadProps {
  onAnalysisComplete: (analysisResults: {
    beats: number[];
    tempo: number;
    mood: string;
    segments: any[];
  }) => void;
}

export default function AudioUpload({ onAnalysisComplete }: AudioUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    await processFile(file);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an MP3 or WAV file.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Create a temporary URL for the file
      const fileUrl = URL.createObjectURL(file);

      // Process the audio file using the URL
      const results = await analyzeAudio(fileUrl);
      
      // Clean up the temporary URL
      URL.revokeObjectURL(fileUrl);

      onAnalysisComplete(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze audio file');
      console.error('Audio analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex flex-col items-center gap-4 border-2 border-dashed border-gray-300 p-8 rounded-lg"
    >
      <Button variant="outline" disabled={isAnalyzing}>
        <label className="cursor-pointer">
          {isAnalyzing ? 'Analyzing...' : 'Upload Audio File'}
          <input
            type="file"
            accept=".mp3,.wav"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isAnalyzing}
          />
        </label>
      </Button>
      
      <p className="text-sm text-gray-500">
        Drag and drop an audio file here, or click to select
      </p>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
