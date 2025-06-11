import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, TextInput, TouchableOpacity, Image, StatusBar, ImageBackground, Keyboard, Text } from 'react-native';
import apiClient from '../../service/api/apiInterceptors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StackNavigationProp } from '@react-navigation/stack';

interface ForgetPasswordProps {
  navigation: StackNavigationProp<any>;
  route: any;
}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({ navigation, route }) => {
  const [mobileno, setMobileno] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (route?.params?.mobileNo) {
      setMobileno(route.params.mobileNo);
    }
  }, [route]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const requestOtp = async (): Promise<void> => {
    try {
      const response = await apiClient.get('/api/user/forgotpassword/otp', {
        params: { mobile: mobileno },
      });
      if (response.data) {
        Alert.alert('OTP Sent', 'Please check your mobile for the OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const resetPassword = async (): Promise<void> => {
    if (!mobileno || !otp || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter all required fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    try {
      const response = await apiClient.put('/api/user/forgotpassword/reset', {
        mobile: mobileno,
        otp,
        newpassword: newPassword,
        confirmpassword: confirmPassword,
      });

      if (response.data) {
        Alert.alert('Success', 'Your password has been reset successfully.');
        setMobileno('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        navigation.navigate('Login');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
   <View style={styles.container}>
  <StatusBar backgroundColor="#F6A001" barStyle="light-content" />
  
  <View style={styles.logoContainer}>
    <Image source={require('../../../assets/logo.jpg')} style={styles.logoImage} />
    <Text style={styles.heading}>Forgot Password</Text>
  </View>

  <View style={styles.inputContainer}>
    <Icon name="phone" size={20} color="#888" style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholder="Mobile Number"
      keyboardType="number-pad"
      value={mobileno}
      onChangeText={setMobileno}
      maxLength={10}
      placeholderTextColor="#999"
    />
  </View>

  <TouchableOpacity style={styles.button} onPress={requestOtp}>
    <Text style={styles.buttonText}>Request OTP</Text>
  </TouchableOpacity>

  <View style={styles.inputContainer}>
    <Icon name="key" size={20} color="#888" style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholder="Enter OTP"
      keyboardType="number-pad"
      value={otp}
      onChangeText={setOtp}
      maxLength={6}
      placeholderTextColor="#999"
    />
  </View>

  <View style={styles.inputContainer}>
    <Icon name="lock" size={20} color="#888" style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholder="New Password"
      secureTextEntry={!passwordVisible}
      value={newPassword}
      onChangeText={setNewPassword}
      placeholderTextColor="#999"
    />
    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
      <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
    </TouchableOpacity>
  </View>

  <View style={styles.inputContainer}>
    <Icon name="lock-check" size={20} color="#888" style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholder="Confirm Password"
      secureTextEntry={!passwordVisible}
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      placeholderTextColor="#999"
    />
  </View>

  <TouchableOpacity style={styles.button} onPress={resetPassword}>
    <Text style={styles.buttonText}>Reset Password</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => navigation.navigate('LoginApp')}>
    <Text style={styles.backToLogin}>← Back to Login</Text>
  </TouchableOpacity>
</View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, justifyContent: 'center' },
  phototcontainer: { width: 80, height: 80, position: 'absolute', top: 0, right: 0 },
  topRightImage: { position: 'absolute', top: 0, right: 0, width: 80, height: 70 },
  logoContainer: { alignItems: 'center'},
  logoText: { fontSize: 21, fontWeight: 'bold', color: '#333', marginTop: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center',  borderWidth: 1,
    borderColor: '#e2e8f0',   borderRadius: 10, paddingHorizontal: 10, marginVertical: 10, width: '100%', backgroundColor: '#ffffff' },
  input: { flex: 1, height: 50, padding: 10, fontSize: 16 },
  icon: { marginRight: 10 },
  button: { width: '70%', height: 50, backgroundColor: '#F6A001', borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  photobottomtcontainer: { position: 'absolute', bottom: 1, left: 0, transform: [{ translateX: -42 }], width: 60, height: 60 },
  inputBackground: { width: '100%', height: 450, justifyContent: 'center', alignItems: 'center' },
  logoImage: {
  width: 170,
  height: 150,
  borderRadius: 45,
  marginBottom: 10,
},

heading: {
  fontSize: 18,
  fontWeight: '600',
  color: '#333',
  marginBottom: 20,
},





backToLogin: {
  marginTop: 12,
  color: '#F6A001',
  fontSize: 14,
  fontWeight: '500',
  textDecorationLine: 'underline',
},

});

export default ForgetPassword;