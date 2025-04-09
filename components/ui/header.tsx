import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Header = () => {
  return (
    <LinearGradient
      colors={['#4D7C0F', '#7BAA3C', '#ECFCCB']}
      style={styles.header}
    >
      <Text style={styles.title}>BKGrocery</Text>
      <Text style={styles.subtitle}>Welcome!</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height:  210,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    marginTop: 8,
  },
});

export default Header;