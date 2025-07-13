import { StyleSheet } from 'react-native';

export default StyleSheet.create({

   container: {
    margin: 10,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: '#333',
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },

      pickerWrapper: {
        backgroundColor: '#ffffff',
        // backgroundColor : 'red',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
       
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
   

    });