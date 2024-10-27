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
      <input type="file" accept=".mp3, .wav" onChange={handleFileSelect} />
      <p>Drag and drop an audio file here, or click to select a file.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AudioUpload;
