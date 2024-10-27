import sys
import warnings
import librosa
from textblob import TextBlob

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
