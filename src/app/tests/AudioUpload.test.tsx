import React from 'react';
import "@testing-library/jest-dom"
import { render, fireEvent } from '@testing-library/react';
import AudioUpload from '../../components/AudioUpload';

describe('AudioUpload Component', () => {
  it('accepts valid audio files', () => {
    const mockFile = new File(['audio content'], 'test.mp3', { type: 'audio/mp3' });
    const onFileSelect = jest.fn();

    const { getByText, getByLabelText } = render(<AudioUpload onFileSelect={onFileSelect} />);
    const input = getByLabelText(/select a file/i);

    fireEvent.change(input, { target: { files: [mockFile] } });

    expect(onFileSelect).toHaveBeenCalledWith(mockFile);
    expect(getByText(/drag and drop an audio file here/i)).toBeInTheDocument();
  });

  it('rejects invalid file types', () => {
    const mockFile = new File(['text content'], 'test.txt', { type: 'text/plain' });
    const onFileSelect = jest.fn();

    const { getByText, getByLabelText } = render(<AudioUpload onFileSelect={onFileSelect} />);
    const input = getByLabelText(/select a file/i);

    fireEvent.change(input, { target: { files: [mockFile] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(getByText(/invalid file type/i)).toBeInTheDocument();
  });
});
import React from 'react';
import "@testing-library/jest-dom"
import { render, fireEvent } from '@testing-library/react';
import AudioUpload from '../../components/AudioUpload';

describe('AudioUpload Component', () => {
  it('accepts valid audio files', () => {
    const mockFile = new File(['audio content'], 'test.mp3', { type: 'audio/mp3' });
    const onFileSelect = jest.fn();

    const { getByText, getByLabelText } = render(<AudioUpload onFileSelect={onFileSelect} />);
    const input = getByLabelText(/select a file/i);

    fireEvent.change(input, { target: { files: [mockFile] } });

    expect(onFileSelect).toHaveBeenCalledWith(mockFile);
    expect(getByText(/drag and drop an audio file here/i)).toBeInTheDocument();
  });

  it('rejects invalid file types', () => {
    const mockFile = new File(['text content'], 'test.txt', { type: 'text/plain' });
    const onFileSelect = jest.fn();

    const { getByText, getByLabelText } = render(<AudioUpload onFileSelect={onFileSelect} />);
    const input = getByLabelText(/select a file/i);

    fireEvent.change(input, { target: { files: [mockFile] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(getByText(/invalid file type/i)).toBeInTheDocument();
  });
});
