import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CardioSenseLogoProps {
  size?: number;
  showText?: boolean;
}

export const CardioSenseLogo: React.FC<CardioSenseLogoProps> = ({ size = 32, showText = true }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Path
          d="M50 84C50 84 16 62 16 35C16 22 26 13 39 13C46 13 50 17 50 17C50 17 54 13 61 13C74 13 84 22 84 35C84 62 50 84 50 84Z"
          stroke="#38BDF8"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M23 49H35L42 35L51 65L60 43L66 51H77"
          stroke="#0284c7"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      {showText && (
        <Text style={styles.brandText}>
          CardioSense <Text style={styles.accentText}>AI</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  accentText: {
    color: '#0284c7',
  },
});
