import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: object;
  variant?: 'default' | 'outline';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onPress, 
  style = {}, 
  variant = 'default', 
  disabled = false 
}) => {
  const buttonStyles = [
    styles.base,
    variant === 'outline' ? styles.outline : styles.default,
    disabled && styles.disabled,
    style
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.8}
    >
      {disabled ? (
        <ActivityIndicator color={variant === 'outline' ? '#00FF88' : '#FFFFFF'} />
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  default: {
    backgroundColor: '#00FF88',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  disabled: {
    opacity: 0.5,
  },
});