import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Theme } from '../../constants/theme';
import { UploadCloud, FileAudio, CheckCircle2 } from 'lucide-react-native';

interface UploadPickerProps {
  onFileSelected: (uri: string, name: string) => void;
  selectedFilename: string | null;
}

export const UploadPicker: React.FC<UploadPickerProps> = ({
  onFileSelected,
  selectedFilename,
}) => {
  const [fileDetails, setFileDetails] = useState<{ name: string; size?: number } | null>(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/webm'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setFileDetails({ name: file.name, size: file.size });
        onFileSelected(file.uri, file.name);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick audio file. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePickDocument}
        style={styles.dropZone}
      >
        <UploadCloud size={36} color={Theme.colors.primary} />
        <Text style={styles.title}>Tap to browse audio file</Text>
        <Text style={styles.subtitle}>Accepted formats: WAV, MP3, WebM</Text>
      </TouchableOpacity>

      {selectedFilename ? (
        <View style={styles.fileSelectedBox}>
          <FileAudio size={20} color={Theme.colors.primary} />
          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFilename}
            </Text>
            {fileDetails?.size ? (
              <Text style={styles.fileSize}>
                {(fileDetails.size / 1024).toFixed(1)} KB • Ready for Analysis
              </Text>
            ) : null}
          </View>
          <CheckCircle2 size={18} color={Theme.colors.normal} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  dropZone: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Theme.colors.borderStrong,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Theme.typography.sm,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  fileSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  fileDetails: {
    flex: 1,
    marginHorizontal: Theme.spacing.sm,
  },
  fileName: {
    fontSize: Theme.typography.sm,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  fileSize: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
});
