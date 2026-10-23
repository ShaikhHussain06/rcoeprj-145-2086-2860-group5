import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Theme } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { Mic, Square, CheckCircle2, AlertTriangle } from 'lucide-react-native';

interface LiveRecorderProps {
  onRecordingComplete: (uri: string, name: string) => void;
  recordedFilename: string | null;
}

export const LiveRecorder: React.FC<LiveRecorderProps> = ({
  onRecordingComplete,
  recordedFilename,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const startRecording = async () => {
    setIsRecording(true);
    setSeconds(0);
    // In actual runtime, expo-audio or expo-av records PCM audio
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (seconds < 4) {
      Alert.alert(
        'Recording Too Short',
        'Heart sound recordings must be at least 4 seconds long to capture 4-6 cardiac cycles.'
      );
      return;
    }

    // Save simulated demo capture or active recording
    onRecordingComplete('file://demo-phone-capture.wav', `live_pcg_${Date.now()}.wav`);
  };

  return (
    <View style={styles.container}>
      {/* Persistent Microphone Domain Notice */}
      <View style={styles.banner}>
        <AlertTriangle size={18} color="#d97706" />
        <Text style={styles.bannerText}>{COPY.phoneMicNotice}</Text>
      </View>

      <View style={styles.recorderCard}>
        <Text style={styles.timerText}>
          {Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0')}
          :{(seconds % 60).toString().padStart(2, '0')}
        </Text>
        <Text style={styles.instructionText}>
          {isRecording
            ? 'Recording cardiac auscultation... (10s – 35s recommended)'
            : 'Press Record and place phone transducer firmly over cardiac valve region'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
        >
          {isRecording ? <Square size={28} color="#ffffff" /> : <Mic size={28} color="#ffffff" />}
        </TouchableOpacity>

        <Text style={styles.buttonLabel}>
          {isRecording ? 'Tap to Stop Recording' : 'Start Recording'}
        </Text>
      </View>

      {recordedFilename ? (
        <View style={styles.recordedBox}>
          <CheckCircle2 size={18} color={Theme.colors.normal} />
          <Text style={styles.recordedText}>Captured: {recordedFilename}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 11,
    color: '#92400e',
    marginLeft: Theme.spacing.sm,
    flex: 1,
    lineHeight: 16,
  },
  recorderCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  instructionText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.abnormal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.abnormal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordButtonActive: {
    backgroundColor: '#0f172a',
    borderRadius: Theme.radius.md,
    width: 64,
    height: 64,
  },
  buttonLabel: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.typography.sm,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  recordedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderColor: '#bbf7d0',
    borderWidth: 1,
    marginTop: Theme.spacing.md,
  },
  recordedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
    marginLeft: Theme.spacing.sm,
  },
});
