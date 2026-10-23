import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SegmentAnalysis } from '../api/types';
import { Theme } from '../constants/theme';

interface SegmentTimelineProps {
  segments: SegmentAnalysis[];
}

export const SegmentTimeline: React.FC<SegmentTimelineProps> = ({ segments }) => {
  if (!segments || segments.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temporal Segment Murmur Localization</Text>
      <Text style={styles.subtitle}>
        4.0-second sliding windows with 2.0-second overlap (50% temporal hop)
      </Text>

      <View style={styles.list}>
        {segments.map((seg) => {
          const isFlagged = seg.abnormal_probability >= 0.49;
          const percentage = Math.round(seg.abnormal_probability * 100);

          return (
            <View
              key={seg.segment_index}
              style={[styles.segmentRow, isFlagged ? styles.rowFlagged : styles.rowNormal]}
            >
              <View style={styles.leftCol}>
                <Text style={styles.segIndexText}>Segment {seg.segment_index}</Text>
                <Text style={styles.segTimeText}>
                  {seg.start_time_sec.toFixed(1)}s – {seg.end_time_sec.toFixed(1)}s
                </Text>
              </View>

              <View style={styles.midCol}>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: isFlagged ? Theme.colors.abnormal : Theme.colors.normal,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.statusLabel}>{seg.status}</Text>
              </View>

              <View style={styles.rightCol}>
                <Text
                  style={[
                    styles.probText,
                    { color: isFlagged ? Theme.colors.abnormal : Theme.colors.normal },
                  ]}
                >
                  {percentage}%
                </Text>
              </View>
            </View>
          );
        })}
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
  title: {
    fontSize: Theme.typography.sm,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  list: {
    marginTop: 4,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowFlagged: {
    backgroundColor: '#fff7ed',
  },
  rowNormal: {
    backgroundColor: 'transparent',
  },
  leftCol: {
    width: 80,
  },
  segIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  segTimeText: {
    fontSize: 10,
    color: Theme.colors.textMuted,
  },
  midCol: {
    flex: 1,
    marginHorizontal: Theme.spacing.sm,
  },
  barBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 9,
    color: Theme.colors.textSecondary,
  },
  rightCol: {
    width: 44,
    alignItems: 'flex-end',
  },
  probText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
