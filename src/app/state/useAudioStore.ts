import {create} from 'zustand';

interface AudioState {
  audioFile: File | null;
  setAudioFile: (file: File) => void;
  clearAudioFile: () => void;
  getAudioFile: () => File | null;
}

const useAudioStore = create<AudioState>((set) => ({
  audioFile: null,
  setAudioFile: (file) => set({ audioFile: file }),
  clearAudioFile: () => set({ audioFile: null }),
  getAudioFile: () => getAudioFileFromState(),
}));

function getAudioFileFromState(): File | null {
  const state = useAudioStore.getState();
  return state.audioFile;
}

export default useAudioStore;
