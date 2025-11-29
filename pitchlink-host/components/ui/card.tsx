import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: object;
}

export const Card: React.FC<CardProps> = ({ children, style = {} }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  style?: object;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style = {} }) => {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
});