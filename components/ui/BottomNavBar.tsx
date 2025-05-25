import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

type TabItem = {
  key: string;
  icon: any;
  label: string;
};

type BottomNavBarProps = {
  onTabPress?: (tab: string) => void;
  activeTab: string;
};

const tabs: TabItem[] = [
  { key: 'import', icon: require('../../assets/images/warehouse.png'), label: 'Import' },
  { key: 'history', icon: require('../../assets/images/historyicon.png'), label: 'History' },
  { key: 'receipt', icon: require('../../assets/images/rcpiconwhite.png'), label: 'Receipt' },
  { key: 'setting', icon: require('../../assets/images/settingicon.png'), label: 'Setting' },
  { key: 'home', icon: require('../../assets/images/homeicon.png'), label: 'Home' },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onTabPress, activeTab }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isCenter = tab.key === 'receipt';
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isCenter && styles.centerButton]}
            onPress={() => onTabPress && onTabPress(tab.key)}
          >
            <Image
              source={tab.icon}
              style={[
                styles.icon,
                isCenter && styles.centerIcon,
                isActive && styles.activeIcon,
              ]}
              resizeMode="contain"
            />
            {!isCenter && (
              <Text
                style={[
                  styles.label
                ]}
              >
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F7FEE7',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    backgroundColor: '#4D7C0F',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: '#D9F99D',
    padding: 20,
    marginTop: -30,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#355E00',
  },
  centerIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  activeIcon: {
    tintColor: '#355E00',
  },
  label: {
    fontSize: 10,
    color: '#355E00',
    marginTop: 4,
  },
  activeLabel: {
    color: '#355E00',
    fontWeight: '600',
  },
});
