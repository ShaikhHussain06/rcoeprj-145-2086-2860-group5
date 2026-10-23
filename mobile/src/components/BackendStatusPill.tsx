import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Endpoints } from '../api/endpoints';
import { Theme } from '../constants/theme';

export const BackendStatusPill: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['server-health'],
    queryFn: () => Endpoints.getHealth(),
    refetchInterval: 12000, // Check every 12 seconds
    retry: 1,
  });

  const isOnline = !isError && data?.status === 'online';

  return (
    <View style={[styles.pill, isOnline ? styles.pillOnline : styles.pillOffline]}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#0284c7" style={styles.indicator} />
      ) : (
        <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      )}
      <Text style={[styles.text, isOnline ? styles.textOnline : styles.textOffline]}>
        {isLoading
          ? 'Connecting...'
          : isOnline
          ? `Backend Online (${data?.compute_device?.toUpperCase() || 'CPU'})`
          : 'Backend Offline'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillOnline: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  pillOffline: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOnline: {
    backgroundColor: Theme.colors.badgeOnline,
  },
  dotOffline: {
    backgroundColor: Theme.colors.badgeOffline,
  },
  indicator: {
    marginRight: 6,
  },
  text: {
    fontSize: Theme.typography.xs,
    fontWeight: '600',
  },
  textOnline: {
    color: '#15803d',
  },
  textOffline: {
    color: '#b91c1c',
  },
});
