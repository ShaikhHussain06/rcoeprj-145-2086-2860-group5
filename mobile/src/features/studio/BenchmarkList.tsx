import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BenchmarkSample } from '../../api/types';
import { Theme } from '../../constants/theme';
import { Play, CheckCircle2, AlertCircle } from 'lucide-react-native';

interface BenchmarkListProps {
  samples: BenchmarkSample[];
  selectedId: string | null;
  onSelect: (sample: BenchmarkSample) => void;
  isLoading?: boolean;
}

export const BenchmarkList: React.FC<BenchmarkListProps> = ({
  samples,
  selectedId,
  onSelect,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Loading curated PhysioNet samples...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {samples.map((sample) => {
        const isSelected = selectedId === sample.id;
        const isAbnormal = sample.condition === 'Abnormal';

        return (
          <TouchableOpacity
            key={sample.id}
            activeOpacity={0.7}
            onPress={() => onSelect(sample)}
            style={[styles.card, isSelected && styles.cardSelected]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.leftRow}>
                {isAbnormal ? (
                  <AlertCircle size={18} color={Theme.colors.abnormal} />
                ) : (
                  <CheckCircle2 size={18} color={Theme.colors.normal} />
                )}
                <Text style={styles.sampleId}>{sample.id.toUpperCase()}</Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isAbnormal
                        ? Theme.colors.abnormalMuted
                        : Theme.colors.normalMuted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isAbnormal ? Theme.colors.abnormal : Theme.colors.normal },
                    ]}
                  >
                    {sample.condition}
                  </Text>
                </View>
              </View>

              <Text style={styles.durationText}>{sample.duration_sec}s</Text>
            </View>

            <Text style={styles.titleText}>{sample.title}</Text>
            <Text style={styles.contextText}>{sample.clinical_context}</Text>

            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Play size={14} color="#ffffff" />
                <Text style={styles.selectedIndicatorText}>Selected for Auscultation Analysis</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  center: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Theme.spacing.sm,
    fontSize: Theme.typography.sm,
    color: Theme.colors.textSecondary,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.sm,
  },
  cardSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#f0f9ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sampleId: {
    fontSize: Theme.typography.sm,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    marginLeft: 6,
    marginRight: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  durationText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  titleText: {
    fontSize: Theme.typography.sm,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginVertical: 2,
  },
  contextText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Theme.radius.sm,
    alignSelf: 'flex-start',
    marginTop: Theme.spacing.sm,
  },
  selectedIndicatorText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
});
