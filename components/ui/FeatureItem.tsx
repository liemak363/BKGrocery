import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';

type FeatureItemProps = {
  image: ImageSourcePropType;
  label: string;
  onPress?: () => void;
};

const FeatureItem: React.FC<FeatureItemProps> = ({ image, label, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <Image source={image} style={styles.icon} resizeMode="contain" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default FeatureItem;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F7FEE7',
    margin: 10,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: '#355E00',
  },
  label: {
    color: '#355E00',
    fontSize: 14,
    fontWeight: '500',
  },
});
