import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, FlatList, Button, Linking, Alert, BackHandler } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import CommonPicker from '../../CommonCompoent/CommonPicker';
import useForm from '../../Common/UseForm';
import { launchCamera } from 'react-native-image-picker';
import * as Location from 'expo-location';
import ViewShot from 'react-native-view-shot';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { PermissionsAndroid, Dimensions } from 'react-native';
import apiClient from '../../service/api/apiInterceptors';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { validateStepOne, validateSteptwo, validateStepthree, validateStepFour, validateStepFive } from '../../FormValidation/Formvalidates';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerParamList } from '../../Type/DrawerParam';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
};

type Chawl = {
  isCopiedFromFirst: boolean | undefined;
  isCopiedFromPrevious?: boolean;
  length: string;
  breadth: string;
  height: string;
  originalValues?: {
    length: string;
    breadth: string;
    height: string;
  };
};



const qualityOptions = [
  { label: 'Select Quality', value: '' },
  { label: 'Excellent', value: 'excellent' },
  { label: 'Good', value: 'good' },
  { label: 'Average', value: 'average' },
  { label: 'Poor', value: 'poor' },
];

const staffBehaviorOptions = [
  { label: 'Select Behavior Rating', value: '' },
  { label: 'Excellent', value: 'excellent' },
  { label: 'Good', value: 'good' },
  { label: 'Satisfactory', value: 'satisfactory' },
  { label: 'Poor', value: 'poor' },
];

const ReviewForm = () => {
  const { state, updateState } = useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigation = useNavigation<StackNavigationProp<DrawerParamList>>();
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [chawlList, setChawlList] = useState<Chawl[]>([]);
  const [binList, setBinList] = useState<Chawl[]>([{ isCopiedFromFirst: false, length: '', breadth: '', height: '' }]);
  const [imageUri, setImageUri] = useState<ImageAsset[]>([]);
  const [screenshots, setScreenshots] = useState<ImageAsset[]>([]);
  const [showInspectionButton, setShowInspectionButton] = useState(false);
  const [selectedStorageId, setSelectedStorageId] = useState('');
  const isFocused = useIsFocused();

  const viewShotRefs = useRef<Array<ViewShot | null>>([]);
  const totalSteps = 6;

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [navigation])
  );

  useEffect(() => {
    if (isFocused) {
      updateState({
        form: {
          option1: '',
          option2: '',
          federationType: '',
          option3: '',
          fpofpcdata: '',
          Storagedata: '',
          Farmers: '',
          quanityfound: '',
          Depositedfound: '',
          Weighmentslip: '',
          stockQuality: '',
          staffBehavior: '',
          additionalComments: '',
          noOfChawls: '',
          noofbins: '',
          deterioration: '',
          quanityfoundsystem: '',
          assayingDone: '',
          laborRegister: '',
          inspectionStatus: '',
          chawlDimensions: [],
          binDimensions: []
        },
        hidden: { ...state.hidden, currentStep: 1 }
      });

      setCurrentStep(1);
      setImageUri([]);
      setChawlList([{ isCopiedFromFirst: false, length: '', breadth: '', height: '' }]);
      setBinList([{ isCopiedFromFirst: false, length: '', breadth: '', height: '' }]);
      setShowInspectionButton(false);
      setSelectedStorageId('');
    }
  }, [isFocused]);

  useEffect(() => {
    CompanyDropdown();
    FederationType();
  }, []);

  useEffect(() => {
    if (state.form.option1) {
      updateState({
        form: {
          ...state.form,
          option2: '',
          federationType: '',
          option3: '',
          fpofpcdata: '',
          Storagedata: ''
        },
        fielddata: {
          ...state.fielddata,
          Branchdata: null,
          federation: null,
          fpofpc: null,
          storageLocation: null
        }
      });
      BranchDropdown(state.form.option1);
    }
  }, [state.form.option1]);

  useEffect(() => {
    if (state.form.option2) {
      updateState({
        form: {
          ...state.form,
          federationType: '',
          option3: '',
          fpofpcdata: '',
          Storagedata: ''
        },
        fielddata: {
          ...state.fielddata,
          federation: null,
          fpofpc: null,
          storageLocation: null
        }
      });
    }
  }, [state.form.option2]);

  useEffect(() => {
    if (state.form.option2 && state.form.federationType) {
      updateState({
        form: {
          ...state.form,
          option3: '',
          fpofpcdata: '',
          Storagedata: ''
        },
        fielddata: {
          ...state.fielddata,
          federation: null,
          fpofpc: null,
          storageLocation: null
        }
      });

      if (state.form.federationType === 'FEDERATION') {
        Federation(state.form.option2);
      } else if (state.form.federationType === 'SOCIETY') {
        Society(state.form.option2);
      } else if (state.form.federationType === 'PACCS') {
        Paccs(state.form.option2);
      }
    }
  }, [state.form.federationType, state.form.option2]);

  useEffect(() => {
    if (state.form.option3) {
      if (state.form.federationType === 'FEDERATION') {
        FpoandFpc(state.form.option3);
      } else if (state.form.federationType === 'SOCIETY' || state.form.federationType === 'PACCS') {
        Storagelocation(state.form.option3);
      }
    }
  }, [state.form.option3]);

  useEffect(() => {
    if (state.form.fpofpcdata) {
      Storagelocation(state.form.fpofpcdata);
      console.log('id', state.form.fpofpcdata);
    }
  }, [state.form.fpofpcdata]);

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  const handleCheckInspection = () => {
    if (!state.form.Storagedata) {
      alert('Please select a storage location');
      return;
    }
    navigation.navigate('InspectionList', {
      storageId: state.form.Storagedata,
    });
  };





  const CompanyDropdown = () => {
    apiClient.get('/api/dropdown/company')
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              Company: res.data,
            }
          });
        }
      })
      .catch(console.error);
  };

  const BranchDropdown = (companyId: string) => {
    const url = `/api/group?CompanyId=${companyId}&GroupType=Branch&BranchType=PROCURING&BranchType=BOTH&ApprovalStatus=APPROVED&IsActive=true`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              Branchdata: res.data
            }
          });
        }
      })
      .catch(console.error);
  };

  const FederationType = () => {
    apiClient.get('/api/enum/FederationType')
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              federationType: res.data,
            }
          });
        }
      })
      .catch(console.error);
  };


  const Society = (BranchId: string) => {
    const url = `/api/group?BranchId=${BranchId}&GroupType=Vendor&VendorType=SOCIETY&ApprovalStatus=APPROVED&IsActive=true`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              federation: res.data,
            }
          });
        }
      })
      .catch(console.error);
  };

  const Paccs = (BranchId: string) => {
    const url = `/api/group?BranchId=${BranchId}&GroupType=Vendor&VendorType=PACCS&ApprovalStatus=APPROVED&IsActive=true`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              federation: res.data,
            }
          });
        }
      })
      .catch(console.error);
  };

  const Federation = (BranchId: string) => {
    const url = `/api/group?FederationType=FEDERATION&GroupBy=FEDERATION&ApprovalStatus=APPROVED&BranchId=${BranchId}`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              federation: res.data,
            }
          });
        }
      })
      .catch(console.error);
  };

  const FpoandFpc = (federationId: string) => {
    const url = `/api/group?VendorType=FPC&VendorType=FPO&FederationId=${federationId}`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              fpofpc: res.data,
            }
          });
        }
      })
      .catch(console.error);
  };

  const Storagelocation = (groupId: string) => {
    const url = `/api/storagelocation?GroupId=${groupId}&StorageType=NORMAL&LocationType=STORAGELOCATION&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&IsActive=true&CompanyId=`;
    console.log('API URL:', url); // URL bhi console pe dekh lo
    apiClient.get(url)
      .then((res) => {
        console.log('STORAGE API response:', res.data); // Yeh pura response console pe print karega
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              storageLocation: res.data,
            }
          });
        }
      })
      .catch((error) => {
        console.error('API error:', error); // Agar koi error aata hai toh usko bhi console pe dekh lo
      });
  };


  useEffect(() => {
    if (selectedStorageId) {
      StorageById(selectedStorageId);
      console.log(' use effect stoarge id', selectedStorageId);
    }
  }, [selectedStorageId]);



  const StorageById = (storageId: string) => {
    const url = `/api/storagelocation/${storageId}`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          console.log('API totalStockMT:', res.data.totalStockMT);
          updateState({
            fielddata: {
              ...state.fielddata,
              Storagebyid: res.data
            },
            form: {
              ...state.form,
              quanityfoundsystem: res.data.totalStockMT?.toString()
            }
          });
        }
      })
      .catch(console.error);
  };


  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Location permission denied');
      return;
    }

    let locationData = await Location.getCurrentPositionAsync({});
    setLocation(locationData.coords);

    let reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: locationData.coords.latitude,
      longitude: locationData.coords.longitude,
    });

    if (reverseGeocode.length > 0) {
      setAddress(reverseGeocode[0] || null);
      const address = `${reverseGeocode[0].name}, ${reverseGeocode[0].city}, ${reverseGeocode[0].region}, ${reverseGeocode[0].country}`;
      setFormattedAddress(address);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          openCamera();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      openCamera();
    }
  };

  const openCamera = async () => {
    launchCamera({ mediaType: 'photo' }, (response) => {
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
        const newIndex = imageUri.length;

        setImageUri((prev) => {
          const updatedList = [...prev, newImage];
          fetchLocation();
          setTimeout(() => {
            captureSingleScreenshot(newIndex);
          }, 2000);
          return updatedList;
        });
      }
    });
  };

  const captureSingleScreenshot = async (index: number) => {
    try {
      const ref = viewShotRefs.current[index];
      if (ref && typeof ref.capture === 'function') {
        const uri = await ref.capture();
        if (uri) {
          const screenshotImage: ImageAsset = {
            uri,
            fileName: `screenshot_${Date.now()}.jpg`,
            type: 'image/jpeg',
          };
          setScreenshots((prev) => [...prev, screenshotImage]);
        }
      }
    } catch (error) {
      console.error('Screenshot error:', error);
    }
  };

  const handleChawlCountChange = (val: string) => {
    const noOfChawls = parseInt(val) || 0;

    if (noOfChawls > 500) {
      Alert.alert('Warning', 'You can enter a maximum of 500 chawls.');
    }



    const numericValue = val.replace(/[^0-9]/g, '');
    updateState({
      form: {
        ...state.form,
        noOfChawls: numericValue,
      },
    });

    let num = parseInt(numericValue);
    if (isNaN(num) || num < 1) {
      setChawlList([{ isCopiedFromFirst: false, length: '', breadth: '', height: '' }]);
      return;
    }

    const updatedList: Chawl[] = Array.from({ length: num }, (_, index) => {
      return chawlList[index] || { length: '', breadth: '', height: '' };
    });
    setChawlList(updatedList);
  };

  const handleChawlDimensionChange = (index: number, field: keyof Chawl, value: string) => {
    const updatedList = [...chawlList];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value
    };
    setChawlList(updatedList);
    updateState({
      form: {
        ...state.form,
        chawlDimensions: updatedList
      }
    });
  };

  const handleBinCountChange = (val: string) => {

    const noOfBins = parseInt(val) || 0;

    if (noOfBins > 500) {
      Alert.alert('Warning', 'You can enter a maximum of 500 chawls.');
    }

    const numericValue = val.replace(/[^0-9]/g, '');
    updateState({
      form: {
        ...state.form,
        noofbins: numericValue,
      },
    });

    let num = parseInt(numericValue);
    if (isNaN(num) || num < 1) {
      setBinList([{ isCopiedFromFirst: false, length: '', breadth: '', height: '' }]);
      return;
    }

    const updatedList: Chawl[] = Array.from({ length: num }, (_, index) => {
      return binList[index] || { length: '', breadth: '', height: '' };
    });
    setBinList(updatedList);
  };

  const handleBinDimensionChange = (index: number, field: keyof Chawl, value: string) => {
    const updatedList = [...binList];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value,
    };
    setBinList(updatedList);
    updateState({
      form: {
        ...state.form,
        binDimensions: updatedList,
        noofbins: updatedList.length.toString(),
      },
    });
  };

  const handleSubmit = async () => {
    if (!isSubmitted) {
      setIsSubmitted(true);


      try {
        const formData = new FormData();

        formData.append('NoOfFarmers', state.form.Farmers);
        formData.append('TotalPhysicalQuantity', state.form.quanityfound);
        formData.append('TotalProcuerQuantity', state.form.Depositedfound);
        formData.append('NoOfWeighmentSlip', state.form.Weighmentslip);
        formData.append('QualityOfStock', state.form.stockQuality);
        formData.append('StaffBehavior', state.form.staffBehavior);
        formData.append('AdditionalComments', state.form.additionalComments);

        const chawlSizes = chawlList.map(chawl => ({
          chawlType: "Chawl",
          length: chawl.length,
          breadth: chawl.breadth,
          height: chawl.height,
          quantity: Math.max(
            1,
            (Number(chawl.height) * Number(chawl.breadth) * Number(chawl.length) * 20) / 1000
          )
        }));

        const binSizes = binList.map(bin => ({
          chawlType: "Bin",
          length: bin.length,
          breadth: bin.breadth,
          height: bin.height,
          quantity: Math.max(
            1,
            (Number(bin.height) * Number(bin.breadth) * Number(bin.length) * 20) / 1000
          )
        }));

        const allSizes = [...chawlSizes, ...binSizes];

        allSizes.forEach((item, index) => {
          formData.append(`ChawlSizes[${index}][chawlType]`, item.chawlType);
          formData.append(`ChawlSizes[${index}][length]`, item.length);
          formData.append(`ChawlSizes[${index}][breadth]`, item.breadth);
          formData.append(`ChawlSizes[${index}][height]`, item.height);
          formData.append(`ChawlSizes[${index}][quantity]`, item.quantity.toString());
        });

        screenshots.forEach((image, index) => {
          formData.append('Files', {
            uri: image.uri,
            name: image.fileName || `image_${index}.jpg`,
            type: image.type || 'image/jpeg'
          } as any);
        });

        if (location) {
          formData.append('location', `LOC${new Date().toISOString().replace(/[-:.]/g, '').slice(0, -5)}`);
        }

        const url = `/api/mobile?location=${state.form.Storagedata}`;
        const response = await apiClient.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Response:', response.data);
        alert('Form submitted successfully!');

        updateState({
          form: {
            option1: '',
            option2: '',
            federationType: '',
            option3: '',
            fpofpcdata: '',
            Storagedata: '',
            Farmers: '',
            quanityfound: '',
            Depositedfound: '',
            Weighmentslip: '',
            stockQuality: '',
            staffBehavior: '',
            additionalComments: '',
            noOfChawls: '',
            noofbins: '',
            deterioration: '',
            quanityfoundsystem: '',
            assayingDone: '',
            laborRegister: '',
            inspectionStatus: '',
            chawlDimensions: [],
            binDimensions: []
          }
        });

        setChawlList([]);
        setImageUri([]);
        setCurrentStep(1);
      }

      catch (error) {
        console.error('Error submitting form:', error);

        let errorMessage = 'Failed to submit form. Please try again.';

        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object'
        ) {
          // Server responded with a status outside the 2xx range
          const status = (error as any).response.status;

          if (status === 502) {
            errorMessage = 'Bad Gateway (502). The server is temporarily unavailable.';
          } else {
            errorMessage = `Error ${status}: ${(error as any).response.statusText || 'Unexpected error occurred.'}`;
          }
        } else if (
          typeof error === 'object' &&
          error !== null &&
          'request' in error &&
          (error as any).request
        ) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your internet connection.';
        } else if (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as any).message === 'string'
        ) {
          // Something else caused the error
          errorMessage = (error as any).message || errorMessage;
        }

        Alert.alert('Error', errorMessage);
      
      }

      finally {
    setIsSubmitted(false); // ✅ Re-enable button, show "Submit"
  }


    }

  };

  const nextStep = () => {
    if (currentStep === 1) {
      const validation = validateStepOne(state.form);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.message);
        return;
      }
    }

    if (currentStep === 2) {
      const validation = validateSteptwo(state.form);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.message);
        return;
      }
    }

    if (currentStep === 3) {
      const validation = validateStepthree(state.form);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.message);
        return;
      }
    }

    if (currentStep === 4) {
      const validation = validateStepFour(state.form);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.message);
        return;
      }
    }

    if (currentStep === 5) {
      const validation = validateStepFive(state.form);
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.message);
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <CommonPicker
              label="COMPANY NAME"
              selectedValue={state.form.option1 || ''}
              onValueChange={(value) => {
                updateState({
                  form: {
                    ...state.form,
                    option1: value,
                    option2: '',
                    federationType: '',
                    option3: '',
                    fpofpcdata: '',
                    Storagedata: ''
                  },
                });
                setSelectedStorageId(''); // Clear storage ID
                setShowInspectionButton(false); // Hide inspection button
              }}
              items={[
                { label: 'Select Company Name', value: '' },
                ...(state.fielddata.Company?.map((item: { text: string; value: string }) => ({
                  label: item.text,
                  value: item.value,
                })) || [])
              ]}
            />

            <CommonPicker
              label="Branch Name"
              selectedValue={state.form.option2 || ''}
              onValueChange={(value) => {
                updateState({
                  form: {
                    ...state.form,
                    option2: value,
                    federationType: '',
                    option3: '',
                    fpofpcdata: '',
                    Storagedata: ''
                  },
                });
              }}
              items={[
                { label: 'Select Branch Name', value: '' },
                ...(state.fielddata.Branchdata?.map((item: { name: string; id: string }) => ({
                  label: item.name,
                  value: item.id,
                })) || [])
              ]}
            />

            <CommonPicker
              label="Select Federation Type"
              selectedValue={state.form.federationType}
              onValueChange={(value) => {
                updateState({
                  form: {
                    ...state.form,
                    federationType: value,
                    option3: '',
                    fpofpcdata: '',
                    Storagedata: ''
                  },
                  fielddata: {
                    ...state.fielddata,
                    federation: null,
                    fpofpc: null,
                    storageLocation: null
                  }
                });
              }}
              items={[
                { label: 'Select Federation Type', value: '' },
                ...(state.fielddata.federationType?.map((item: { text: string; value: string }) => ({
                  label: item.text,
                  value: item.value,
                })) || [])
              ]}
            />

            {state.form.federationType === 'FEDERATION' && (
              <>
                {state.fielddata.federation && (
                  <CommonPicker
                    label="Select Federation"
                    selectedValue={state.form.option3 || ''}
                    onValueChange={(value) => {
                      updateState({
                        form: {
                          ...state.form,
                          option3: value,
                          fpofpcdata: '',
                          Storagedata: ''
                        },
                      });
                    }}
                    items={[
                      { label: 'Select Federation', value: '' },
                      ...(state.fielddata.federation?.map((item: { name: string; id: string }) => ({
                        label: item.name,
                        value: item.id,
                      })) || [])
                    ]}
                  />
                )}

                {state.form.option3 && state.fielddata.fpofpc && (
                  <CommonPicker
                    label="Select FPO/FPC"
                    selectedValue={state.form.fpofpcdata || ''}
                    onValueChange={(value) => {
                      updateState({
                        form: {
                          ...state.form,
                          fpofpcdata: value,
                          Storagedata: ''
                        },
                      });
                    }}
                    items={[
                      { label: 'Select FPO/FPC', value: '' },
                      ...(state.fielddata.fpofpc?.map((item: { name: string; id: string }) => ({
                        label: item.name,
                        value: item.id,
                      })) || [])
                    ]}
                  />
                )}
              </>
            )}

            {state.form.federationType === 'SOCIETY' && (
              <>
                {state.fielddata.federation && (
                  <CommonPicker
                    label="Select Society"
                    selectedValue={state.form.option3 || ''}
                    onValueChange={(value) => {
                      updateState({
                        form: {
                          ...state.form,
                          option3: value,
                          Storagedata: ''
                        },
                      });
                    }}
                    items={[
                      { label: 'Select Society', value: '' },
                      ...(state.fielddata.federation?.map((item: { name: string; id: string }) => ({
                        label: item.name,
                        value: item.id,
                      })) || [])
                    ]}
                  />
                )}
              </>
            )}

            {state.form.federationType === 'PACCS' && (
              <>
                {state.fielddata.federation && (
                  <CommonPicker
                    label="Select PACCS"
                    selectedValue={state.form.option3 || ''}
                    onValueChange={(value) => {
                      updateState({
                        form: {
                          ...state.form,
                          option3: value,
                          Storagedata: ''
                        },
                      });
                    }}
                    items={[
                      { label: 'Select PACCS', value: '' },
                      ...(state.fielddata.federation?.map((item: { name: string; id: string }) => ({
                        label: item.name,
                        value: item.id,
                      })) || [])
                    ]}
                  />
                )}
              </>
            )}



            {state.form.option3 && state.fielddata.storageLocation && (
              <CommonPicker
                label="Select Storage"
                selectedValue={state.form.Storagedata || ''}
                onValueChange={(value) => {
                  updateState({
                    form: {
                      ...state.form,
                      Storagedata: value,
                    },
                  });

                  if (value) {
                    setSelectedStorageId(value);
                    setShowInspectionButton(true);
                  }


                  else {
                    setShowInspectionButton(false);
                  }
                }}
                items={[
                  { label: 'Select storage', value: '' },
                  ...(state.fielddata.storageLocation?.map((item: { name: string; id: string }) => ({
                    label: item.name,
                    value: item.id,
                  })) || [])
                ]}
              />
            )}


            {showInspectionButton && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.inspectionButton}
                  onPress={handleCheckInspection}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonTexti}>Check Inspection Status</Text>
                  <MaterialIcons name="search" size={20} color="#fff" style={styles.icon} />
                </TouchableOpacity>
              </View>
            )}




          </View>
        );
      case 2:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Stock Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>No of Chawls:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number of chawls"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={4}
                value={state.form.noOfChawls || ''}
                onChangeText={handleChawlCountChange}
              />
            </View>

            <FlatList
              data={chawlList}
              keyExtractor={(_, index) => `chawl-${index}`}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Size of Chawls (L x B x H)</Text>
                  <View style={styles.dimensionsContainer}>
                    <TextInput
                      style={[styles.input, styles.dimensionInput]}
                      placeholder="Length"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={item.length}
                      onChangeText={(val) => handleChawlDimensionChange(index, 'length', val)}
                    />
                    <Text style={styles.dimensionSeparator}>×</Text>
                    <TextInput
                      style={[styles.input, styles.dimensionInput]}
                      placeholder="Breadth"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={item.breadth}
                      onChangeText={(val) => handleChawlDimensionChange(index, 'breadth', val)}
                    />
                    <Text style={styles.dimensionSeparator}>×</Text>
                    <TextInput
                      style={[styles.input, styles.dimensionInput]}
                      placeholder="Height"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={item.height}
                      onChangeText={(val) => handleChawlDimensionChange(index, 'height', val)}
                    />
                  </View>

                  {index === 1 && chawlList.length > 1 && (
                    <View style={styles.checkboxContainer}>
                      <CheckBox
                        value={chawlList[index].isCopiedFromFirst}
                        onValueChange={(newValue) => {
                          const updatedList = [...chawlList];
                          if (newValue) {
                            updatedList[index] = {
                              ...updatedList[index],
                              originalValues: {
                                length: updatedList[index].length,
                                breadth: updatedList[index].breadth,
                                height: updatedList[index].height,
                              },
                              ...chawlList[0],
                              isCopiedFromFirst: true
                            };
                          } else {
                            if (updatedList[index].originalValues) {
                              updatedList[index] = {
                                ...updatedList[index],
                                ...updatedList[index].originalValues,
                                isCopiedFromFirst: false,
                                originalValues: undefined
                              };
                            } else {
                              updatedList[index] = {
                                ...updatedList[index],
                                length: '',
                                breadth: '',
                                height: '',
                                isCopiedFromFirst: false
                              };
                            }
                          }
                          setChawlList(updatedList);
                          updateState({
                            form: {
                              ...state.form,
                              chawlDimensions: updatedList
                            }
                          });
                        }}
                      />
                      <Text style={styles.checkboxLabel}>Copy from the Above</Text>
                    </View>
                  )}

                  {index > 0 && (
                    <View style={styles.buttonRow}>
                      {index > 1 && (
                        <View style={styles.checkboxContainer}>
                          <CheckBox
                            value={chawlList[index].isCopiedFromPrevious || false}
                            onValueChange={(newValue) => {
                              const updatedList = [...chawlList];
                              if (newValue) {
                                updatedList[index] = {
                                  ...updatedList[index],
                                  originalValues: {
                                    length: updatedList[index].length,
                                    breadth: updatedList[index].breadth,
                                    height: updatedList[index].height,
                                  },
                                  ...updatedList[index - 1],
                                  isCopiedFromPrevious: true
                                };
                              } else {
                                if (updatedList[index].originalValues) {
                                  updatedList[index] = {
                                    ...updatedList[index],
                                    ...updatedList[index].originalValues,
                                    isCopiedFromPrevious: false,
                                    originalValues: undefined
                                  };
                                } else {
                                  updatedList[index] = {
                                    ...updatedList[index],
                                    length: '',
                                    breadth: '',
                                    height: '',
                                    isCopiedFromPrevious: false
                                  };
                                }
                              }
                              setChawlList(updatedList);
                              updateState({
                                form: {
                                  ...state.form,
                                  chawlDimensions: updatedList
                                }
                              });
                            }}
                          />
                          <Text style={styles.checkboxLabel}>Copy from the Above</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>No of Bins</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number of bins"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.noofbins || ''}
                onChangeText={handleBinCountChange}
              />

              <FlatList
                data={binList}
                keyExtractor={(_, index) => `bin-${index}`}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Size of Bins (L x B x H)</Text>
                    <View style={styles.dimensionsContainer}>
                      <TextInput
                        style={[styles.input, styles.dimensionInput]}
                        placeholder="Length"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={item.length}
                        onChangeText={(val) => handleBinDimensionChange(index, 'length', val)}
                      />
                      <Text style={styles.dimensionSeparator}>×</Text>
                      <TextInput
                        style={[styles.input, styles.dimensionInput]}
                        placeholder="Breadth"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={item.breadth}
                        onChangeText={(val) => handleBinDimensionChange(index, 'breadth', val)}
                      />
                      <Text style={styles.dimensionSeparator}>×</Text>
                      <TextInput
                        style={[styles.input, styles.dimensionInput]}
                        placeholder="Height"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={item.height}
                        onChangeText={(val) => handleBinDimensionChange(index, 'height', val)}
                      />
                    </View>

                    {index === 1 && binList.length > 1 && (
                      <View style={styles.checkboxContainer}>
                        <CheckBox
                          value={binList[index].isCopiedFromFirst}
                          onValueChange={(newValue) => {
                            const updatedList = [...binList];
                            if (newValue) {
                              updatedList[index] = {
                                ...updatedList[index],
                                originalValues: {
                                  length: updatedList[index].length,
                                  breadth: updatedList[index].breadth,
                                  height: updatedList[index].height,
                                },
                                ...binList[0],
                                isCopiedFromFirst: true,
                              };
                            } else {
                              if (updatedList[index].originalValues) {
                                updatedList[index] = {
                                  ...updatedList[index],
                                  ...updatedList[index].originalValues,
                                  isCopiedFromFirst: false,
                                  originalValues: undefined,
                                };
                              } else {
                                updatedList[index] = {
                                  ...updatedList[index],
                                  length: '',
                                  breadth: '',
                                  height: '',
                                  isCopiedFromFirst: false,
                                };
                              }
                            }
                            setBinList(updatedList);
                            updateState({
                              form: {
                                ...state.form,
                                binDimensions: updatedList,
                              },
                            });
                          }}
                        />
                        <Text style={styles.checkboxLabel}>Copy from the Above</Text>
                      </View>
                    )}

                    {index > 0 && (
                      <View style={styles.buttonRow}>
                        {index > 1 && (
                          <View style={styles.checkboxContainer}>
                            <CheckBox
                              value={binList[index].isCopiedFromPrevious || false}
                              onValueChange={(newValue) => {
                                const updatedList = [...binList];
                                if (newValue) {
                                  updatedList[index] = {
                                    ...updatedList[index],
                                    originalValues: {
                                      length: updatedList[index].length,
                                      breadth: updatedList[index].breadth,
                                      height: updatedList[index].height,
                                    },
                                    ...updatedList[index - 1],
                                    isCopiedFromPrevious: true,
                                  };
                                } else {
                                  if (updatedList[index].originalValues) {
                                    updatedList[index] = {
                                      ...updatedList[index],
                                      ...updatedList[index].originalValues,
                                      isCopiedFromPrevious: false,
                                      originalValues: undefined,
                                    };
                                  } else {
                                    updatedList[index] = {
                                      ...updatedList[index],
                                      length: '',
                                      breadth: '',
                                      height: '',
                                      isCopiedFromPrevious: false,
                                    };
                                  }
                                }
                                setBinList(updatedList);
                                updateState({
                                  form: {
                                    ...state.form,
                                    binDimensions: updatedList,
                                  },
                                });
                              }}
                            />
                            <Text style={styles.checkboxLabel}>Copy from the Above</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Quantity Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Stock Deterioration</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <CheckBox
                  value={state.form.deterioration === 'Fast'}
                  onValueChange={() =>
                    updateState({ form: { ...state.form, deterioration: 'Fast' } })
                  }
                />
                <Text style={{ marginRight: 20 }}>Fast</Text>
                <CheckBox
                  value={state.form.deterioration === 'Normal'}
                  onValueChange={() =>
                    updateState({ form: { ...state.form, deterioration: 'Normal' } })
                  }
                />
                <Text>Normal</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Total Quantity Found (MT)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Total Quantity Found in MT"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={state.form.quanityfound || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, quanityfound: val } })
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Total Quantity Found as per System</Text>
              <TextInput
                style={styles.input}
                placeholder="Total Quantity Found"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.quanityfoundsystem}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, quanityfoundsystem: val } })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Deposited Quantity in Chawls and Bins (MT)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Total Deposited Quantity"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.Depositedfound || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, Depositedfound: val } })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantity of Assaying Completed</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.assayingDone || ''}
                onChangeText={(val) =>
                  updateState({ form: { ...state.form, assayingDone: val } })
                }
              />
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Documentation</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of Farmers</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Number of Farmers"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.Farmers || ''}
                onChangeText={(val) => {
                  if (val === '' || /^\d+$/.test(val)) {
                    const num = parseInt(val, 10);
                    if (val === '' || num <= 18000) {
                      updateState({ form: { ...state.form, Farmers: val } });
                    } else {
                      Alert.alert("Validation Error", "Number of Farmers cannot exceed 18,000");
                    }
                  }
                }}
                maxLength={5}
              />
              {state.form.Farmers && parseInt(state.form.Farmers) > 18000 && (
                <Text style={{ color: 'red' }}>Cannot exceed 18,000</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of Weighment Slip</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Number Weighment Slip"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={state.form.Weighmentslip || ''}
                onChangeText={(val) => {
                  if (state.form.laborRegister !== 'NO') {
                    updateState({ form: { ...state.form, Weighmentslip: val } });
                  }
                }}
                editable={state.form.laborRegister !== 'NO'}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Labor Register Available</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    state.form.laborRegister === 'YES' && styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    updateState({
                      form: {
                        ...state.form,
                        laborRegister: 'YES',
                        Weighmentslip: state.form.Weighmentslip || '0'
                      }
                    })
                  }
                >
                  <Text style={[
                    styles.radioLabel,
                    state.form.laborRegister === 'YES' && styles.radioLabelSelected
                  ]}>YES</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    state.form.laborRegister === 'NO' && styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    updateState({
                      form: {
                        ...state.form,
                        laborRegister: 'NO',
                        Weighmentslip: '0'
                      }
                    })
                  }
                >
                  <Text style={[
                    styles.radioLabel,
                    state.form.laborRegister === 'NO' && styles.radioLabelSelected
                  ]}>NO</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Quality Assessment</Text>

            <CommonPicker
              selectedValue={state.form.stockQuality || ''}
              onValueChange={(value) =>
                updateState({ form: { ...state.form, stockQuality: value } })
              }
              items={qualityOptions}
              label="How is the quality of Stock"
            />

            <CommonPicker
              selectedValue={state.form.staffBehavior || ''}
              onValueChange={(value) =>
                updateState({ form: { ...state.form, staffBehavior: value } })
              }
              items={staffBehaviorOptions}
              label="Staff Behavior"
            />
          </View>
        );
      case 6:
        return (
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            <View style={styles.buttoncontent}>
              <TouchableOpacity style={styles.camerabutton} onPress={requestCameraPermission}>
                <MaterialIcons name="add-a-photo" size={30} color="white" />
                <Text style={styles.buttonText}>Pick from Camera</Text>
              </TouchableOpacity>
            </View>

            <View>
              {imageUri.length < 3 && (
                <Text style={{ color: 'red', marginBottom: 10 }}>
                  Please upload at least 3 images.
                </Text>
              )}

              {imageUri.map((img, index) => (
                <View key={index} style={{ marginBottom: 20 }}>
                  <ViewShot
                    ref={(ref) => { viewShotRefs.current[index] = ref; }}
                    options={{ format: 'jpg', quality: 1.0 }}
                  >
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: img.uri }} style={styles.image} resizeMode="cover" />
                      <View style={styles.overlay}>
                        {location && address ? (
                          <>
                            <Text style={styles.overlayText}>
                              Latitude: {location.latitude}, Longitude: {location.longitude}
                            </Text>
                            <Text style={styles.overlayText}>{formattedAddress}</Text>
                          </>
                        ) : (
                          <ActivityIndicator size="small" color="#ffffff" />
                        )}
                      </View>
                    </View>
                  </ViewShot>
                </View>
              ))}
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>Additional Comments</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter any remarks or observations here"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={state.form.additionalComments}
                onChangeText={(val) => {
                  updateState({ form: { ...state.form, additionalComments: val } });
                }}
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >

      <SafeAreaView style={styles.safeArea}>


        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}


        >

          <View>



            {renderStep()}


            <View style={styles.navigationButtons}>
              {currentStep > 1 && (
                <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                  <Text style={styles.navButtonpreviousText}>Previous</Text>
                </TouchableOpacity>
              )}

              {currentStep < totalSteps ? (
                <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitted && styles.disabledButton
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitted}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitted ? 'Submitting' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );

};

const styles = StyleSheet.create({
  safeArea: {

    backgroundColor: '#ffffff',
    height: '90%',
  },
  viewShot: {
    width: '100%',
    alignSelf: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc', // Different color when disabled
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isSmallDevice ? 5 : 8,
  },
  scrollContainer: {
    flexGrow: 1, // Allows content to expand beyond screen
    paddingBottom: 20, // Extra space at bottom


  },
  header: {
    backgroundColor: '#070738',
    padding: isSmallDevice ? 15 : 20,
    borderRadius: 10,
    marginBottom: isSmallDevice ? 15 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  headerText: {
    color: '#fff',
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dimensionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionInput: {
    flex: 1,
    marginRight: isSmallDevice ? 3 : 5,
    textAlign: 'center',
    fontSize: isSmallDevice ? 14 : 16,
  },
  dimensionSeparator: {
    color: '#666',
    fontSize: isSmallDevice ? 14 : 16,
    marginHorizontal: isSmallDevice ? 3 : 5,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: isSmallDevice ? 3 : 5,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: isSmallDevice ? 15 : 20,
    marginRight: isSmallDevice ? 8 : 10,
    backgroundColor: '#f9f9f9',
  },
  radioButtonSelected: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  radioLabel: {
    fontSize: isSmallDevice ? 13 : 15,
    color: '#666',
  },
  radioLabelSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 20 : 30,
    paddingHorizontal: isSmallDevice ? 15 : 25,

  },
  prevButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#070738',
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 16,
    flex: 1,
    marginRight: isSmallDevice ? 8 : 10,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 16,
    flex: 1,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
  },
  navButtonpreviousText: {
    color: 'black',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 16,
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: isSmallDevice ? 16 : 24,
    margin: isSmallDevice ? 10 : 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepIndicator: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#6B7280',
    marginBottom: isSmallDevice ? 12 : 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: isSmallDevice ? 18 : 24,
  },
  buttoncontent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 18 : 24,
    width: isSmallDevice ? '85%' : '70%',
    alignSelf: 'center',
  },
  camerabutton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: isSmallDevice ? 7 : 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    marginLeft: isSmallDevice ? 6 : 8,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: isSmallDevice ? 12 : 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: isSmallDevice ? 180 : 200,
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 14,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: isSmallDevice ? 6 : 8,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 9 : 10,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  inputContainer: {
    marginTop: isSmallDevice ? 12 : 16,
  },
  label: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: isSmallDevice ? 6 : 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 14 : 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: isSmallDevice ? 100 : 120,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: isSmallDevice ? 6 : 8,
  },
  checkboxLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#374151',
    marginLeft: isSmallDevice ? 6 : 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: isSmallDevice ? 18 : 20,
    width: isSmallDevice ? 18 : 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    backgroundColor: '#4CAF50',
  },
  storageContainer: {
    marginTop: isSmallDevice ? 12 : 16,
    padding: isSmallDevice ? 12 : 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 10 : 12,
  },
  storageName: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: isSmallDevice ? 6 : 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 6 : 8,
  },
  infoText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#555',
    marginLeft: isSmallDevice ? 6 : 8,
  },
  coordinatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 6 : 8,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
  },
  coordinateText: {
    fontSize: isSmallDevice ? 12 : 13,
    fontFamily: 'monospace',
  },
  coordinateLabel: {
    fontWeight: '500',
    color: '#4a5568',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dce6fc',
    opacity: 1,
    paddingVertical: isSmallDevice ? 5 : 6,
    borderRadius: 8,
    marginTop: isSmallDevice ? 6 : 8,
  },
  navigateButtonText: {
    color: 'black',
    fontWeight: '500',
    marginLeft: isSmallDevice ? 6 : 8,
    fontSize: isSmallDevice ? 13 : 14,
  },
  buttonContainer: {
    marginVertical: isSmallDevice ? 12 : 15,
    alignItems: 'center',
  },
  inspectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 20 : 25,
    borderRadius: 25,
    shadowColor: '#4a8cff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    width: isSmallDevice ? '95%' : '90%',
  },
  buttonTexti: {
    color: '#fff',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    marginRight: isSmallDevice ? 6 : 8,
  },
  icon: {
    marginLeft: isSmallDevice ? 3 : 5,
  },
  captureButton: {
    marginTop: isSmallDevice ? 6 : 8,
    backgroundColor: '#007bff',
    paddingVertical: isSmallDevice ? 6 : 8,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    borderRadius: 6,
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isSmallDevice ? 13 : 14,
  },
});

export default ReviewForm;