import { create } from 'zustand';
import { PredictResponse, BenchmarkSample } from '../api/types';

interface StudioState {
  selectedSample: BenchmarkSample | null;
  activeAudioUri: string | null;
  activeFilename: string;
  isAnalyzing: boolean;
  lastAnalysisResult: PredictResponse | null;
  error: string | null;

  setSelectedSample: (sample: BenchmarkSample | null) => void;
  setActiveAudio: (uri: string | null, filename: string) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setLastAnalysisResult: (result: PredictResponse | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  selectedSample: null,
  activeAudioUri: null,
  activeFilename: '',
  isAnalyzing: false,
  lastAnalysisResult: null,
  error: null,

  setSelectedSample: (sample) =>
    set({
      selectedSample: sample,
      activeAudioUri: sample ? sample.audio_url : null,
      activeFilename: sample ? `${sample.id}.wav` : '',
      lastAnalysisResult: null,
      error: null,
    }),

  setActiveAudio: (uri, filename) =>
    set({
      activeAudioUri: uri,
      activeFilename: filename,
      selectedSample: null,
      lastAnalysisResult: null,
      error: null,
    }),

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setLastAnalysisResult: (lastAnalysisResult) => set({ lastAnalysisResult }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      selectedSample: null,
      activeAudioUri: null,
      activeFilename: '',
      isAnalyzing: false,
      lastAnalysisResult: null,
      error: null,
    }),
}));
