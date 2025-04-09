// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import {
//   LineChart,
//   AreaChart,
//   YAxis,
//   Grid,
// } from 'react-native-svg-charts';
// import * as shape from 'd3-shape';
// import { Defs, LinearGradient, Stop } from 'react-native-svg';


// type WeeklyRevenueCardProps = {
//   title?: string;
//   total?: string;
//   percentageChange?: string;
//   changeLabel?: string;
//   data: number[];
//   labels?: string[];
// };

// const Gradient = () => (
//   <Defs key="gradient">
//     <LinearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
//       <Stop offset="0%" stopColor="#93D94E" stopOpacity={0.6} />
//       <Stop offset="100%" stopColor="#93D94E" stopOpacity={0.1} />
//     </LinearGradient>
//   </Defs>
// );

// const WeeklyRevenueCard: React.FC<WeeklyRevenueCardProps> = ({
//   title = "Week’s revenue",
//   total = '0 $',
//   percentageChange = '0%',
//   changeLabel = 'VS LAST WEEK',
//   data,
//   labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
// }) => {
//   return (
//     <View style={styles.card}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.title}>{title}</Text>
//           <Text style={styles.amount}>{total}</Text>
//         </View>
//         <View style={styles.right}>
//           <Text style={styles.percent}>{percentageChange}</Text>
//           <Text style={styles.compare}>{changeLabel}</Text>
//         </View>
//       </View>

//       {/* Chart */}
//       <View style={styles.chartContainer}>
//         <YAxis
//           data={data}
//           style={{ marginRight: 8 }}
//           contentInset={{ top: 20, bottom: 20 }}
//           svg={{ fill: '#709F47', fontSize: 10 }}
//           numberOfTicks={4}
//           formatLabel={(value) => `${Math.round(value / 1000)}k`}
//         />

//         <View style={styles.chart}>
//           <AreaChart
//             style={StyleSheet.absoluteFill}
//             data={data}
//             curve={shape.curveLinear}
//             contentInset={{ top: 20, bottom: 20 }}
//             svg={{ fill: 'url(#gradientFill)' }}
//           >
//             <Gradient />
//           </AreaChart>

//           <LineChart
//             style={StyleSheet.absoluteFill}
//             data={data}
//             svg={{ stroke: '#2D5500', strokeWidth: 2 }}
//             contentInset={{ top: 20, bottom: 20 }}
//             curve={shape.curveLinear}
//           >
//             <Grid direction={"HORIZONTAL"} svg={{ strokeDasharray: '4,4', stroke: '#D0E2B1' }}  />
//           </LineChart>
//         </View>
//       </View>

//       {/* Days */}
//       <View style={styles.days}>
//         {labels.map((label) => (
//           <Text key={label} style={styles.day}>
//             {label}
//           </Text>
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#F7FEE7',
//     borderRadius: 16,
//     padding: 16,
//     // marginHorizontal: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   title: {
//     color: '#6A7A59',
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   amount: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1A1A1A',
//   },
//   right: {
//     alignItems: 'flex-end',
//   },
//   percent: {
//     color: '#0C5405',
//     fontWeight: 'bold',
//     fontSize: 20,
//   },
//   compare: {
//     fontSize: 16,
//     color: '#6A7A59',
//   },
//   chartContainer: {
//     flexDirection: 'row',
//     height: 160,
//   },
//   chart: {
//     flex: 1,
//   },
//   days: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//     paddingHorizontal: 8,
//   },
//   day: {
//     fontSize: 10,
//     color: '#6A7A59',
//   },
// });

// export default WeeklyRevenueCard;
