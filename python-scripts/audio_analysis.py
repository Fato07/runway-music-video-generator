import os
import sys
import json
import warnings
import librosa
import numpy as np
from textblob import TextBlob
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={
    r"/analyze": {
        "origins": ["http://localhost:3000"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Enable hot reloading and debug output
app.debug = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Suppress librosa warnings
warnings.filterwarnings("ignore", category=UserWarning, module='librosa')

def analyze_audio_file(file_path):
    """
    Comprehensive audio analysis function that combines all analysis features.
    """
    try:
        # Load the audio file
        y, sr = librosa.load(file_path)
        
        # Get beats
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        
        # Get segments using Wav2Vec2
        feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("facebook/wav2vec2-base-960h")
        model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base-960h")
        
        # Resample for Wav2Vec2 if needed
        if sr != 16000:
            y = librosa.resample(y, orig_sr=sr, target_sr=16000)
            sr = 16000
            
        input_values = feature_extractor(y, sampling_rate=sr, return_tensors="pt").input_values
        
        with torch.no_grad():
            features = model(input_values).last_hidden_state
            
        # Convert features to segments
        segment_length = len(y) // len(features[0])
        segments = []
        
        for i in range(len(features[0])):
            start_time = i * segment_length / sr
            end_time = (i + 1) * segment_length / sr
            
            # Get the mood for this segment
            segment_audio = y[i * segment_length : (i + 1) * segment_length]
            segment_rms = librosa.feature.rms(y=segment_audio)[0].mean()
            
            # Simple mood detection based on RMS energy
            mood = "energetic" if segment_rms > np.mean(librosa.feature.rms(y=y)[0]) else "calm"
            
            segments.append({
                "start": float(start_time),
                "end": float(end_time),
                "mood": mood,
                "description": f"A {mood} section from {start_time:.2f}s to {end_time:.2f}s"
            })
        
        return {
            "beats": beats.tolist(),
            "tempo": float(tempo.item()),  # Convert numpy scalar to Python float properly
            "segments": segments
        }
        
    except Exception as e:
        print(f"Error analyzing audio: {e}")
        return None

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if 'file' not in request.files:
            print("No file in request")
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("Empty filename")
            return jsonify({'error': 'No file selected'}), 400
            
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            try:
                file.save(filepath)
                print(f"File saved to {filepath}")
                
                results = analyze_audio_file(filepath)
                if results:
                    print(f"Analysis completed successfully")
                    return jsonify(results)
                else:
                    print(f"Analysis failed")
                    return jsonify({'error': 'Analysis failed'}), 500
            except Exception as e:
                print(f"Error during analysis: {str(e)}")
                return jsonify({'error': str(e)}), 500
            finally:
                # Move the file to a results folder instead of deleting it
                results_dir = os.path.join(os.path.dirname(filepath), 'results')
                if not os.path.exists(results_dir):
                    os.makedirs(results_dir)
                
                if os.path.exists(filepath):
                    result_filepath = os.path.join(results_dir, filename)
                    os.rename(filepath, result_filepath)
                    print(f"Moved analyzed file to {result_filepath}")
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'error': 'Unknown error occurred'}), 500

if __name__ == "__main__":
    # Enable hot reloading and debugging
    app.run(
        host='0.0.0.0', 
        port=5001,
        debug=True,  # Enables debug mode
        use_reloader=True,  # Enables hot reloading
        threaded=True  # Enables threaded processing
    )
