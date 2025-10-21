import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CircularProgressProps {
  size?: number;
  percentage: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  labelColor?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 120,
  percentage,
  color = '#2e7d32',
  backgroundColor = '#e0e0e0',
  label,
  labelColor = '#212121',
}) => {
  // Versión simplificada usando barras en lugar de círculos
  const progressBars = 20;
  const filledBars = Math.round((percentage / 100) * progressBars);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.progressContainer}>
        {Array.from({ length: progressBars }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              {
                backgroundColor: index < filledBars ? color : backgroundColor,
                transform: [{ rotate: `${(360 / progressBars) * index}deg` }],
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.labelContainer}>
        <Text style={[styles.percentage, { color: labelColor }]}>
          {Math.round(percentage)}%
        </Text>
        {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    width: 4,
    height: '45%',
    borderRadius: 2,
    top: '5%',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
