import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../constants/theme';

interface SignalViewerProps {
  waveformBase64?: string;
  spectrogramBase64?: string;
  title?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const SignalViewer: React.FC<SignalViewerProps> = ({
  waveformBase64,
  spectrogramBase64,
  title = 'Acoustic Signal Processing (DSP)',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Filtered Amplitude Waveform */}
      {waveformBase64 ? (
        <View style={styles.plotCard}>
          <Text style={styles.plotLabel}>Zero-Phase Butterworth Bandpass (20-200 Hz)</Text>
          <Image
            source={{ uri: waveformBase64 }}
            style={styles.imageWaveform}
            resizeMode="contain"
            accessibilityLabel="Butterworth filtered heart sound acoustic amplitude waveform"
          />
        </View>
      ) : null}

      {/* 128-Band Log-Mel Spectrogram */}
      {spectrogramBase64 ? (
        <View style={styles.plotCard}>
          <Text style={styles.plotLabel}>128-Band Log-Mel Spectrogram (20-400 Hz)</Text>
          <Image
            source={{ uri: spectrogramBase64 }}
            style={styles.imageSpectrogram}
            resizeMode="contain"
            accessibilityLabel="128-Band Log-Mel Spectrogram representation of phonocardiogram"
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.sm,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  plotCard: {
    backgroundColor: Theme.colors.surfaceDark,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.xs,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  plotLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: Theme.spacing.sm,
    paddingTop: 4,
    marginBottom: 2,
  },
  imageWaveform: {
    width: screenWidth - 48,
    height: 120,
    backgroundColor: 'transparent',
  },
  imageSpectrogram: {
    width: screenWidth - 48,
    height: 150,
    backgroundColor: 'transparent',
  },
});
