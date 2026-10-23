import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { mapProbabilityToBand } from '../constants/thresholds';

interface ProbabilityGaugeProps {
  pAbnormal: number;
  confidenceScore: number;
}

export const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({ pAbnormal, confidenceScore }) => {
  const band = mapProbabilityToBand(pAbnormal);
  const percentage = Math.round(pAbnormal * 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Acoustic Turbulence Score</Text>
        <View style={[styles.badge, { backgroundColor: band.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: band.color }]}>{band.badgeLabel}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <Text style={[styles.percentText, { color: band.color }]}>{percentage}%</Text>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Decision Threshold: tau* = 49.0%</Text>
          <Text style={styles.metaLabel}>Confidence: {(confidenceScore * 100).toFixed(1)}%</Text>
        </View>
      </View>

      {/* Stratified Color Bar */}
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: band.color }]} />
        {/* Threshold Marker at 49% */}
        <View style={styles.thresholdMarker} />
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendText}>0% Normal</Text>
        <Text style={styles.legendMarkerText}>| tau* = 49%</Text>
        <Text style={styles.legendText}>100% Murmur</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginVertical: Theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.typography.sm,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Theme.spacing.sm,
  },
  percentText: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: Theme.spacing.md,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginBottom: 2,
  },
  barBackground: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  thresholdMarker: {
    position: 'absolute',
    left: '49%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#0f172a',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  legendText: {
    fontSize: 10,
    color: Theme.colors.textMuted,
  },
  legendMarkerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
});
