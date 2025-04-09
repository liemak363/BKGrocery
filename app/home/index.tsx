import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Button, StatusBar } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { AppDispatch } from "../../store/globalStore";
import { useDispatch } from "react-redux";

import Header from '@/components/ui/header';
import UserInfoCard from '@/components/ui/UserInfo';
import InfoCard from '@/components/ui/InfoCard';
import WeeklyRevenueCard from '@/components/ui/WeeklyRevenueCard';
import FeatureItem from '@/components/ui/FeatureItem';
import BottomNavBar from '@/components/ui/BottomNavBar';

export default function explore() {
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState('Home');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <View>
    <ScrollView style={styles.container}>
      {/* Làm trong suốt thanh trạng thái */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <Header />

      {/* User Info */}
      <View style={styles.subcontainer} >
        <View style={styles.userSection}>
          <UserInfoCard
            name="John Wick"
            role="Owner"
            initial="J"
            onPress={() => console.log('User card tapped')}
          />

          <View style={styles.statsRow}>
            <InfoCard 
              value="30657 $"
              label="Total revenue"
              onPress={() => console.log('Revenue card pressed')}
            />

            <InfoCard 
              value={1004}
              label="Total item"
              onPress={() => console.log('Total item card pressed')}
            />
          </View>
        </View>

        <WeeklyRevenueCard
          title="Week’s Revenue"
          total="16,345 $"
          percentageChange="1.3%"
          changeLabel="VS LAST WEEK"
          data={[3900, 600, 950, 500, 1900, 900, 2900]}
        />

      <View style={{marginBottom: 100}}>
        <Text style={styles.mainFeatureTitle}>Main feature</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>

          <FeatureItem image={require('../../assets/images/warehouse.png')} label="Warehouse" />
          <FeatureItem image={require('../../assets/images/import.png')} label="Import" />
          <FeatureItem image={require('../../assets/images/historyicon.png')} label="History" />
          <FeatureItem image={require('../../assets/images/scanicon.png')} label="Scan item" />
          <FeatureItem image={require('../../assets/images/receipicon.png')} label="Receipt" />
          <FeatureItem image={require('../../assets/images/settingicon.png')} label="Setting" />
        </View>
      </View>

        
      </View>
    </ScrollView>
    <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ECFCCB',
  },
  subcontainer: {
    backgroundColor: '#ECFCCB',
    flex: 1,
    // padding: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  userSection: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mainFeatureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  }
});
