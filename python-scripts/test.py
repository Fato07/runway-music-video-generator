import librosa

try:
    y, sr = librosa.load("../src/app/tests/samples/sample.wav")
    print("File loaded successfully.")
except Exception as e:
    print(f"Failed to load audio: {e}")
