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
    const validTypes = ['audio/wav', 'audio/x-wav', 'audio/wave'];
    console.log('Processing file:', file.type);

    if (!validTypes.includes(file.type)) {
      setError('Please upload a WAV file.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Create FormData and append the file directly
      const formData = new FormData();
      formData.append('file', file);

      // Send the file directly to the Flask server
      const response = await fetch('http://localhost:5001/analyze', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const results = await response.json();
      console.log('Analysis results:', results);

      onAnalysisComplete({
        beats: results.beats,
        tempo: results.tempo,
        mood: results.segments[0]?.mood || 'neutral',
        segments: results.segments
      });
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
          {isAnalyzing ? 'Analyzing...' : 'Upload WAV File'}
          <input
            type="file"
            accept=".wav"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isAnalyzing}
          />
        </label>
      </Button>
      
      <p className="text-sm text-gray-500">
        Drag and drop a WAV file here, or click to select
      </p>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
