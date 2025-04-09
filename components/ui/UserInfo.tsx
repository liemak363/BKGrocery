import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserInfoCardProps {
  name: string;
  role: string;
  initial: string;
  onPress?: () => void;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ name, role, initial, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      {/* Left avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}> {initial} </Text>
      </View>

      {/* Name and role */}
      <View style={styles.info}>
        <Text style={styles.name}> {name} </Text>
        <Text style={styles.role}> {role} </Text>
      </View>

      {/* Right arrow icon */}
      <View style={styles.iconWrapper}>
        <Ionicons name="arrow-forward" size={24} color="#2D5500" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#BEF264'  ,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#2D5500',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D5500',
  },
  role: {
    fontSize: 14,
    color: '#2D5500',
    marginTop: 2,
  },
  iconWrapper: {
    backgroundColor: '#D9FB94',
    padding: 10,
    borderRadius: 25,
  },
});

export default UserInfoCard;
