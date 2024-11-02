"use client"
import React, { useState } from 'react';

interface AudioUploadProps {
  onFileSelect: (file: File) => void;
}

const AudioUpload: React.FC<AudioUploadProps> = ({ onFileSelect }) => {
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    validateFile(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateFile(file);
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ['audio/mp3', 'audio/wav'];
    if (validTypes.includes(file.type)) {
      setError(null);
      onFileSelect(file);
    } else {
      setError('Invalid file type. Please upload an MP3 or WAV file.');
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        border: '2px dashed #ccc',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <input type="file" accept=".mp3, .wav" onChange={handleFileSelect} aria-label="select a file" />
      <p>Drag and drop an audio file here, or click to select a file.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AudioUpload;
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { detect_beats, analyze_tempo, extract_mood, segment_audio } from '@/python-scripts/audio_analysis';

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      // Process the audio file
      const beats = await detect_beats(file.path);
      const tempo = await analyze_tempo(file.path);
      const mood = await extract_mood(file.path);
      const segments = await segment_audio(file.path);

      onAnalysisComplete({
        beats,
        tempo,
        mood,
        segments
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze audio file');
      console.error('Audio analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        variant="outline"
        disabled={isAnalyzing}
      >
        <label className="cursor-pointer">
          {isAnalyzing ? 'Analyzing...' : 'Upload Audio File'}
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isAnalyzing}
          />
        </label>
      </Button>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
