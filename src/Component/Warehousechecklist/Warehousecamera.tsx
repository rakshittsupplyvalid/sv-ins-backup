import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Platform, PermissionsAndroid, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { launchCamera } from 'react-native-image-picker';
import type { RouteProp } from '@react-navigation/native';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';


type WarehouseCameraStackParamList = {
  WarehouseCamera: { storageId: string };
};

type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
};

const WarehouseCamera = () => {
  const route = useRoute<RouteProp<WarehouseCameraStackParamList, 'WarehouseCamera'>>();
    const { state, updateState } = useForm();
  const { storageId } = route.params;
  const [imageUri, setImageUri] = useState<ImageAsset[]>([]);
  const [properFencingValue, setProperFencingValue] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission granted');
          openCamera();
        } else {
          console.log('Camera permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      openCamera(); // iOS opens directly
    }
  };

  const handleProperFencingClick = () => {
    Alert.alert(
      'Confirmation',
      'Is proper fencing available?',
      [
        {
          text: 'No',
          onPress: () => {
            console.log('No pressed');
            setProperFencingValue(false);
            handleSubmit(false);
          },
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setProperFencingValue(true);
            requestCameraPermission();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const openCamera = async () => {
    launchCamera({ 
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const newImage: ImageAsset = {
          uri: asset.uri!,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg'
        };
        
        setImageUri([newImage]); // Replace previous images with new one
    
      }
    });
  };


 

 

   const handleSubmit = async (hasFencing: boolean) => {
  setIsUploading(true);
  try {
    const formData = new FormData();

    // Add parameters with array indexing
    formData.append(`parameters[0].insParameterId`, 'IPARA2025052805350726607061');
    formData.append(`parameters[0].value`, hasFencing.toString());

    // Add image if exists
    if (hasFencing && imageUri.length > 0) {
      formData.append(`parameters[0].image`, {
        uri: imageUri[0].uri,
        name: `fencing_${Date.now()}.jpg`,  // Random filename
        type: imageUri[0].type || 'image/jpeg'
      } as any);
    }

    console.log('FormData structure:', {
      insParameterId: 'IPARA2025052805350726607061',
      value: hasFencing,
      image: hasFencing && imageUri.length > 0 ? 'exists' : 'null'
    });

    const response = await apiClient.post(
      `/api/storagelocation/${storageId}/insparameter`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.status === 200) {
      Alert.alert('Success', 'Status updated successfully');
    } else {
      throw new Error(response.data?.message || 'Failed to upload data');
    }
  } catch (error) {
    console.error('Upload error:', error);

  } finally {
    setIsUploading(false);
  }
};


  const federationDropdown = () => {
    const url = `/api/insparameter?parameterType=STORAGELOCATION`;
    apiClient.get(url).then((res) => {
      if (res?.data) {
        console.log("API Response Data:", res.data);
        updateState({
          fielddata: {
            ...state.fielddata,
            Federation: res.data,
            FpoFpcdata: null // Clear FPO data when loading new federations
          }
        });
      } else {
        console.log("No data found in API response.");
      }
    }).catch((error) => {
      console.log("Error fetching data:", error);
    });
  };


    useEffect(() => {
      federationDropdown();
    }, []);

  


//   const handleSubmit = () => {
//     if (properFencingValue === null) {
//       Alert.alert('Error', 'Please confirm proper fencing status first');
//       return;
//     }

//     if (properFencingValue && imageUri.length === 0) {
//       Alert.alert('Error', 'Please take a photo for proper fencing');
//       return;
//     }

//     uploadData(properFencingValue);
//   };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.fencingContainer}
        onPress={handleProperFencingClick}
      >
        <Text style={styles.fencingText}>1. Proper Fencing</Text>
        <Text style={styles.statusText}>
          Status: {properFencingValue === null ? 'Not set' : properFencingValue ? 'Yes' : 'No'}
        </Text>
      </TouchableOpacity>

      {imageUri.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.previewText}>Captured Photo:</Text>
          <Image 
            source={{ uri: imageUri[0].uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      )}

      <TouchableOpacity 
        style={[styles.submitButton, isUploading && styles.submitButtonDisabled]}
        onPress={() => {
          if (properFencingValue === null) {
            Alert.alert('Error', 'Please confirm proper fencing status first');
            return;
          }
          if (properFencingValue && imageUri.length === 0) {
            Alert.alert('Error', 'Please take a photo for proper fencing');
            return;
          }
          handleSubmit(properFencingValue);
        }}
        disabled={isUploading}
      >
        <Text style={styles.submitButtonText}>
          {isUploading ? 'Uploading...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  fencingContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  fencingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    marginTop: 5,
    color: '#666',
  },
  imagePreviewContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WarehouseCamera;