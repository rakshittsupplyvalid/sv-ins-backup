import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import CommonPicker from '../../CommonCompoent/CommonPicker';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';
import { useNavigation } from '@react-navigation/native';

const Warehousechecklist = () => {
  const { state, updateState } = useForm();
  const navigation = useNavigation<any>();

  // Initial data loading
  useEffect(() => {
    CompanyDropdown();
    FederationType();
  }, []);

  // When company changes
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

  // When branch changes
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

  // When federation type changes
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

      // Load appropriate data based on federation type
      if (state.form.federationType === 'FEDERATION') {
        Federation(state.form.option2);
      } else if (state.form.federationType === 'SOCIETY') {
        Society(state.form.option2);
      } else if (state.form.federationType === 'PACCS') {
        Paccs(state.form.option2);
      }
    }
  }, [state.form.federationType, state.form.option2]);

  // When federation/society/paccs is selected
  useEffect(() => {
    if (state.form.option3) {
      if (state.form.federationType === 'FEDERATION') {
        FpoandFpc(state.form.option3);
      } else if (state.form.federationType === 'SOCIETY' || state.form.federationType === 'PACCS') {
        Storagelocation(state.form.option3);
      }
    }
  }, [state.form.option3]);

  // When FPO/FPC is selected
  useEffect(() => {
    if (state.form.fpofpcdata) {
      Storagelocation(state.form.fpofpcdata);
    }
  }, [state.form.fpofpcdata]);

  const handleCompleteChecklist = () => {
    if (!state.form.Storagedata) {
      alert('Please select a storage location');
      return;
    }
    
    navigation.navigate('WarehouseCamera', { 
      storageId: state.form.Storagedata,
      // You can pass additional data if needed
    });
  };

  // API Functions
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
    const url = `/api/storagelocation?GroupId=${groupId}&StorageType=NORMAL&LocationType=STORAGELOCATION&ApprovalStatus=PENDING&IsActive=true&CompanyId=`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              storageLocation: res.data,
            }
          });
        }
      })
      .catch(console.error);
  };

  return (
    <View style={styles.container}>
      {/* Company Dropdown */}
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
        }}
        items={[
          { label: 'Select Company Name', value: '' },
          ...(state.fielddata.Company?.map((item: { text: string; value: string }) => ({
            label: item.text,
            value: item.value,
          })) || [])
        ]}
      />

      {/* Branch Dropdown */}
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

      {/* Federation Type Dropdown */}
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

      {/* Conditional Dropdowns based on Federation Type */}
      {state.form.federationType === 'FEDERATION' && (
        <>
          {/* Federation Dropdown */}
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

          {/* FPO/FPC Dropdown */}
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

          {/* Storage Location Dropdown */}
          {(state.form.fpofpcdata || state.form.option3) && state.fielddata.storageLocation && (
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
        </>
      )}

      {state.form.federationType === 'SOCIETY' && (
        <>
          {/* Society Dropdown */}
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

          {/* Storage Location Dropdown */}
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
        </>
      )}

      {state.form.federationType === 'PACCS' && (
        <>
          {/* PACCS Dropdown */}
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

          {/* Storage Location Dropdown */}
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
        </>
      )}

      {/* Complete Checklist Button */}
      {state.form.Storagedata && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCompleteChecklist}
        >
          <Text style={styles.buttonText}>Complete Checklist</Text>
        </TouchableOpacity>
      )}


      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  button: {
   backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  
  
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Warehousechecklist;