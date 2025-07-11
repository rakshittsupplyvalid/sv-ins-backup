import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Platform, PermissionsAndroid, Image, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { RouteProp } from '@react-navigation/native';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DrawerParamList } from '../../Type/DrawerParam';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

type WarehouseCameraStackParamList = {
  WarehouseCamera: { storageId: string };
};



type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
};

interface InspectionParameter {
  id: string;
  name: string;
  description: string;
  parameterType: string;
}

const WarehouseCamera = () => {
  const route = useRoute<RouteProp<WarehouseCameraStackParamList, 'WarehouseCamera'>>();
  const { state, updateState } = useForm();
  const { storageId } = route.params;
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  const [parameters, setParameters] = useState<InspectionParameter[]>([]);
  const [parameterValues, setParameterValues] = useState<Record<string, boolean | null>>({});
  const [parameterImages, setParameterImages] = useState<Record<string, ImageAsset[]>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [activeParameter, setActiveParameter] = useState<string | null>(null);

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const url = `/api/insparameter?parameterType=STORAGELOCATION`;
        const res = await apiClient.get(url);

        if (res?.data) {
          const initialValues: Record<string, boolean | null> = {};
          const initialImages: Record<string, ImageAsset[]> = {};

          res.data.forEach((param: InspectionParameter) => {
            initialValues[param.id] = null;
            initialImages[param.id] = [];
          });

          setParameters(res.data);
          setParameterValues(initialValues);
          setParameterImages(initialImages);
          updateState({
            fielddata: {
              ...state.fielddata,
              Federation: res.data,
              FpoFpcdata: null
            }
          });
        }
      } catch (error) {
        console.error("Error fetching parameters:", error);
        Alert.alert("Error", "Failed to load inspection parameters");
      }
    };

    fetchParameters();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleParameterClick = (paramId: string) => {
    setActiveParameter(paramId);
    const paramDescription = parameters.find(p => p.id === paramId)?.description;

    Alert.alert(
      'Confirmation',
      `Is ${paramDescription} available?`,
      [
        {
          text: 'No',
          onPress: () => updateParameterValue(paramId, false),
          style: 'destructive',
        },
        {
          text: 'Yes',
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            if (hasPermission) {
              openCamera(paramId);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const updateParameterValue = (paramId: string, value: boolean) => {
    setParameterValues(prev => ({
      ...prev,
      [paramId]: value,
    }));

    if (!value) {
      setParameterImages(prev => ({
        ...prev,
        [paramId]: [],
      }));
    }
  };

  const openCamera = (paramId: string) => {
    launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    }, (response) => {
      if (response.didCancel) {
        setParameterValues(prev => ({
          ...prev,
          [paramId]: null,
        }));
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        setParameterValues(prev => ({
          ...prev,
          [paramId]: null,
        }));
      } else if (response.assets?.[0]) {
        const asset = response.assets[0];
        const newImage: ImageAsset = {
          uri: asset.uri!,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg'
        };

        setParameterImages(prev => ({
          ...prev,
          [paramId]: [newImage],
        }));
        updateParameterValue(paramId, true);
      }
    });
  };

  const openGallery = (paramId: string) => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    }, (response) => {
      if (response.assets?.[0]) {
        const asset = response.assets[0];
        const newImage: ImageAsset = {
          uri: asset.uri!,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg'
        };

        setParameterImages(prev => ({
          ...prev,
          [paramId]: [newImage],
        }));
      }
    });
  };

  const handleSubmit = async (paramId: string) => {
    const value = parameterValues[paramId];
    const images = parameterImages[paramId] || [];

    if (value === null) {
      Alert.alert("Error", "Please select a status first");
      return;
    }

    if (value === true && images.length === 0) {
      Alert.alert("Error", "Please capture an image for verification");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append(`parameters[0].insParameterId`, paramId);
      formData.append(`parameters[0].value`, value.toString());

      if (value && images.length > 0) {
        formData.append(`parameters[0].image`, {
          uri: images[0].uri,
          name: images[0].fileName,
          type: images[0].type
        } as any);
      }

      const response = await apiClient.post(
        `/api/storagelocation/${storageId}/insparameter`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Status updated successfully");
      } else {
        throw new Error(response.data?.message || 'Failed to upload data');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIndicatorStyle = (value: boolean | null) => {
    if (value === null) return [styles.statusIndicator, styles.statusNotSet];
    if (value) return [styles.statusIndicator, styles.statusYes];
    return [styles.statusIndicator, styles.statusNo];
  };

  const getStatusText = (value: boolean | null) => {
    if (value === null) return 'Not set';
    return value ? 'Verified' : 'Not Available';
  };

  return (

    <View
      style={styles.container}
    >

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('WarehouseChecklist')}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Sorage</Text>
      </View>


      <ScrollView

        contentContainerStyle={styles.contentContainer}
      >


        {parameters.map(param => {
          const value = parameterValues[param.id];
          const images = parameterImages[param.id] || [];
          const isComplete = value !== null && (value === false || images.length > 0);

          return (

            <View
              key={param.id}
              style={[
                styles.parameterCard,
                isComplete && styles.completedCard,
                activeParameter === param.id && styles.activeCard
              ]}
            >



              <View style={styles.cardHeader}>
                <Text style={styles.parameterTitle}>{param.description}</Text>
                <Text style={getStatusIndicatorStyle(value)}>
                  {getStatusText(value)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleParameterClick(param.id)}
              >
                <Text style={styles.actionButtonText}>
                  {value === null ? 'Set Status' : 'Change Status'}
                </Text>
              </TouchableOpacity>

              {/* {value === true && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => openGallery(param.id)}
              >
                <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            )}

            {images.length > 0 && (
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Captured Photo</Text>
                <Image 
                  source={{ uri: images[0].uri }}
                  style={styles.imagePreview}
                />
              </View>
            )} */}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!isComplete || isUploading) && styles.submitButtonDisabled
                ]}
                onPress={() => handleSubmit(param.id)}
                disabled={!isComplete || isUploading}
              >
                <Text style={styles.submitButtonText}>
                  {isUploading ? (
                    <>
                      <Text style={styles.loadingDot}>•</Text>
                      <Text style={styles.loadingDot}>•</Text>
                      <Text style={styles.loadingDot}>•</Text>
                    </>
                  ) : 'Submit Inspection'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0, // Add this to prevent double padding at the top
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F79B00',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Ensure items are aligned to the start
    width: '100%', // Ensure full width
  },
  headerTitle: {
      
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    color: 'white',
    marginLeft: 16, // Use margin instead of padding for spacing

  
  },


  parameterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e9ecef',
  },
  completedCard: {
    borderLeftColor: '#4caf50',
  },
  activeCard: {
    borderLeftColor: '#38a169',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  parameterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
  },
  statusNotSet: {
    backgroundColor: '#fff3bf',
    color: '#e67700',
  },
  statusYes: {
    backgroundColor: '#ebfbee',
    color: '#2b8a3e',
  },
  statusNo: {
    backgroundColor: '#ffecf0',
    color: '#c92a2a',
  },
  actionButton: {
    backgroundColor: '#f2b54e',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#4a5568',
    fontWeight: '500',
    fontSize: 15,
  },
  imageSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#4a5568',
    fontWeight: '500',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#38a169',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#a0aec0',
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingDot: {
    fontSize: 20,
    marginHorizontal: 2,
    color: 'white',
  },
});

export default WarehouseCamera;