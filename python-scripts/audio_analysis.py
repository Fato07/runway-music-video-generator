import os
import sys
import warnings
import librosa
from textblob import TextBlob
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model
import torch
 

# Suppress librosa warnings
warnings.filterwarnings("ignore", category=UserWarning, module='librosa')

def detect_beats(file_path):
    try:
        y, sr = librosa.load(file_path)
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        return {"beats": beats.tolist()}
    except Exception as e:
        print(f"Error loading file: {e}")
        return []

def analyze_tempo(file_path):
    try:
        y, sr = librosa.load(file_path)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        return {"tempo": float(tempo) if isinstance(tempo, (int, float)) else float(tempo[0])}
    except Exception as e:
        print(f"Error loading file: {e}")
        return 0


def extract_mood(text):
    analysis = TextBlob(text)
    return analysis.sentiment.polarity

def segment_audio(file_path):
     """
     Segments the audio file into chunks based on shifts in audio features extracted using Wav2Vec2.

     Parameters:
     - file_path (str): The path to the audio file to be segmented.

     Returns:
     - list: A list containing the embeddings for each segment.
    """
     # Load the Wav2Vec2 model and feature extractor
     feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("facebook/wav2vec2-base-960h")
     model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base-960h")

     # Load the audio file
     signal, sr = librosa.load(file_path, sr=16000)

     # Extract features using Wav2Vec2
     input_values = feature_extractor(signal, sampling_rate=sr, return_tensors="pt").input_values
     with torch.no_grad():
         features = model(input_values).last_hidden_state

     # Convert the embeddings to a numpy array
     embeddings = features.squeeze(0).numpy().tolist()

     return embeddings

 
if __name__ == "__main__":
    command = sys.argv[1]
    file_path = sys.argv[2]

    if command == "beats":
        beats = detect_beats(file_path)
        import json
        print(json.dumps(beats))
    elif command == "tempo":
        tempo = analyze_tempo(file_path)
        import json
        print(json.dumps(tempo))
    elif command == "mood":
        text = sys.argv[2]
        mood = extract_mood(text)
        print(mood)
    elif command == "segment":
         segments = segment_audio(file_path)
         import json
         print(json.dumps(segments))

