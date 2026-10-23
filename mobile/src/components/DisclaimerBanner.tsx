import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../constants/theme';
import { COPY } from '../constants/copy';

interface DisclaimerBannerProps {
  customText?: string;
  isCompact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ customText, isCompact = false }) => {
  return (
    <View style={[styles.container, isCompact && styles.compactContainer]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>INVESTIGATIONAL</Text>
      </View>
      <Text style={[styles.text, isCompact && styles.compactText]}>
        {customText || COPY.mandatoryDisclaimer}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eff6ff', // Sky-50
    borderColor: '#bae6fd', // Sky-200
    borderWidth: 1,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
  },
  compactContainer: {
    padding: Theme.spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0284c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  text: {
    fontSize: Theme.typography.xs,
    color: '#0369a1',
    lineHeight: 18,
  },
  compactText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
