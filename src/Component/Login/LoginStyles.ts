// src/styles/LoginStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.08, // Responsive padding
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.05,
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: 'contain',
  },
  inputContainer: {
    marginBottom: height * 0.02,
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: isSmallDevice ? 12 : 15,
    borderRadius: 8,
    fontSize: isSmallDevice ? 14 : 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingRight: 40, // Space for icon
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    padding: isSmallDevice ? 12 : 15,
    fontSize: isSmallDevice ? 14 : 16,
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10, // Half of icon size
  },
  button: {
    borderRadius: 8,
    paddingVertical: isSmallDevice ? 12 : 14,
    backgroundColor: '#FF9500',
    marginTop: height * 0.02,
  },
  buttonText: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  forgotPassword: {
    marginTop: height * 0.02,
    textAlign: 'center',
    color: '#FF9500',
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '500',
  },
});