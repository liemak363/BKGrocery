import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type InfoCardProps = {
  value: string | number;
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
};

const InfoCard: React.FC<InfoCardProps> = ({ value, label, onPress }) => {
  return (
    <TouchableOpacity  activeOpacity={0.8} onPress={onPress} style={{ width: '46%'}}>
        <LinearGradient
            colors={['#B7EE57', '#E5FFAF']}
            style={styles.card}
        >
            <View>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
            <Ionicons name="arrow-forward" size={28} color="#2D5500" />
        </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    // width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#C8F562',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5500',
  },
  label: {
    fontSize: 16,
    color: '#2D5500',
    marginTop: 4,
  },
});

export default InfoCard;
