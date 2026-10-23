import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Theme } from '../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}) => {
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        isDanger && styles.buttonDanger,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? Theme.colors.primary : '#ffffff'} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            isSecondary && styles.textSecondary,
            (disabled || loading) && styles.textDisabled,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // 48dp minimum accessible touch target
    marginVertical: Theme.spacing.xs,
  },
  buttonSecondary: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  buttonDanger: {
    backgroundColor: Theme.colors.abnormal,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    color: '#ffffff',
    fontSize: Theme.typography.base,
    fontWeight: '700',
  },
  textSecondary: {
    color: Theme.colors.primary,
  },
  textDisabled: {
    color: '#94a3b8',
  },
});
