// src/screens/LoginApp.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

import Storage from '../../utils/Storage';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';
import styles from './LoginStyles'
import { useDisableBackHandler } from '../../service/useDisableBackHandler'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const LoginApp = ({ navigation }: any) => {
  const { state, updateState } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useDisableBackHandler(true);

  useEffect(() => {
    updateState({
      form: {
        mobileNo: '9634958888',
        password: 'Password@123'
      }
    });
  }, []);

  const handleChange = (field: string, value: string) => {
    updateState({
      form: {
        ...state.form,
        [field]: value
      }
    });
  };

  const handleLogin = async () => {
    const { mobileNo, password } = state.form;

    if (!mobileNo || !password) {
      Alert.alert('Error', 'Please enter both mobile number and password');
      return;
    }

    if (mobileNo.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        mobileNo,
        password
      }
      const response = await apiClient.post('/api/login/user', payload);

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Login failed');
      }

      const { token } = response.data;
      if (!token) {
        throw new Error('Authentication token not received');
      }

      Storage.setString('userToken', token);
      console.log('Login successful, token:', token);

      updateState(null);
      navigation.navigate('DrawerNavigator');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid credentials or network error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#F79B00" />
          
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/image.jpg')}
              style={styles.logo}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#a0aec0"
              keyboardType="number-pad"
              value={state.form?.mobileNo || ''}
              onChangeText={(text) => handleChange('mobileNo', text)}
              maxLength={10}
            />
          </View>

          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#a0aec0"
              secureTextEntry={!showPassword}
              value={state.form?.password || ''}
              onChangeText={(text) => handleChange('password', text)}
            />
            <TouchableOpacity 
              style={styles.iconContainer}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? 'visibility-off' : 'visibility'} 
                size={20} 
                color="#a0aec0" 
              />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator style={styles.loader} size="large" color="#FF9500" />
          ) : (
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}
          
          <Text 
            style={styles.forgotPassword} 
            onPress={() => navigation.navigate('ForgetPassword')}
          >
            Forgot Password?
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginApp;