import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import ProcumentList from '../Component/Procurement/ProcumentList';
import ReviewForm from '../Component/Reviewformcomp/Reviewform';
import InspectionList from '../Component/InspactionList/InspactionList';
import InspectionListDetails from '../Component/InspactionList/InspactionListDetails';
import Dashboard from '../Dashboard/DashboardScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Storage from '../utils/Storage';
import { useNavigation } from '@react-navigation/native';
// import pdf from '../Component/Reviewformcomp/Rough';
const Drawer = createDrawerNavigator();

// ===== Custom Drawer Content =====
function CustomDrawerContent(props: any) {
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await Storage.removeItem('userToken');
          navigation.navigate('LoginApp' as never);
        },
      },
    ]);
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={require('../../assets/profile.jpg')}
            style={styles.profileImage}
          />
          <Text style={[styles.profileName, { fontFamily: 'Poppins-SemiBold' }]}>John Doe</Text>
          <Text style={[styles.profileEmail, { fontFamily: 'Poppins-Regular' }]}>john.doe@example.com</Text>
        </View>
        
        {/* Main Drawer Items */}
        <View style={styles.drawerContent}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#000" />
          <Text style={[styles.logoutText, { fontFamily: 'Poppins-Regular' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
      
        headerStyle: { 
          backgroundColor: '#F79B00',
          height: 80,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold', // Apply Poppins to all headers
          fontSize: 18,
        },
        drawerStyle: { 
          backgroundColor: '#FFFFFF', 
          width: 290,
        },
        drawerActiveTintColor: '#818589',
        drawerInactiveTintColor: 'black',
        drawerLabelStyle: {
          fontFamily: 'Poppins-Regular', 
          fontSize: 16,
        },
      }}
    >
      {/* Dashboard (Bottom Item) */}
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="dashboard" size={size} color={color} />
          ),
          drawerItemStyle: { marginTop: 'auto' }, // Push to bottom
        }}
      />

      {/* Review Form */}
      <Drawer.Screen
        name="Review Form"
        component={ReviewForm}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="assignment" size={size} color={color} />
          ),
        }}
      />

      {/* Procurement List */}
    <Drawer.Screen
  name="Procurement List"
  component={ProcumentList}
  initialParams={{ status: 'PENDING' }} // 👈 Default param passed here
  options={{
    drawerIcon: ({ color, size }) => (
      <Icon name="list-alt" size={size} color={color} />
    ),
  }}
/>

{/* <Drawer.Screen
  name="Pdf"
  component={pdf}
 
  options={{
    drawerIcon: ({ color, size }) => (
      <Icon name="list-alt" size={size} color={color} />
    ),
  }}
/> */}


      {/* Hidden Screens (No Drawer Items) */}
      <Drawer.Screen
        name="InspectionList"
        component={InspectionList }
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Inspection List Details"
        component={InspectionListDetails}
        options={{ 
          headerShown: false,
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});