import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CommonPicker from '../../CommonCompoent/CommonPicker';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';

const Warehousechecklist = () => {
  const { state, updateState } = useForm();

  useEffect(() => {
    CompanyDropdown();
    FederationType();
  }, []);

  useEffect(() => {
    if (state.form.option1) { // Only call if option1 (company) has a value
      // Reset branch and federation when company changes
      updateState({
        form: {
          ...state.form,
          option2: '', // reset branch selection
          federationType: '', // reset federation type selection
          option3: '' // reset federation selection
        },
        fielddata: {
          ...state.fielddata,
          Branchdata: null, // clear branch data
          federation: null // clear federation data
        }
      });

      // Load branches for the selected company
      BranchDropdown(state.form.option1);
    }
  }, [state.form.option1]);

  useEffect(() => {
    if (state.form.option2) {
      updateState({
        form: {
          ...state.form,
          federationType: '', // reset federation type selection
          option3: '',// reset federation selection
          Storagedata: ''
        },
        fielddata: {
          ...state.fielddata,
          federation: null // clear federation data
        }
      });

      // Load federations for the selected branch
      Federation(state.form.option2);
    }
  }, [state.form.option2]);

  useEffect(() => {
    if (state.form.option3) {
      console.log('Calling FpoandFpc with federationId:', state.form.option3);
      FpoandFpc(state.form.option3);
    }
  }, [state.form.option3]);


  useEffect(() => {
    if (state.form.fpofpcdata) {
      Storagelocation(state.form.fpofpcdata);
    }
  }, [state.form.fpofpcdata]);

  const CompanyDropdown = () => {
    const url = `/api/dropdown/company`;
    apiClient.get(url).then((res) => {
      if (res?.data) {
        updateState({
          fielddata: {
            ...state.fielddata,
            Company: res.data,
          }
        });
      } else {
        console.log("No data found in API response.");
      }
    }).catch((error) => {
      console.log("Error fetching data:", error);
    });
  };

  const BranchDropdown = (companyId: string) => {
    const url = `/api/group?CompanyId=${companyId}&GroupType=Branch&BranchType=PROCURING&BranchType=BOTH&ApprovalStatus=APPROVED&IsActive=true`;
    apiClient.get(url).then((res) => {
      if (res?.data) {
        updateState({
          fielddata: {
            ...state.fielddata,
            Branchdata: res.data
          }
        });
      } else {
        console.log("No data found in API response.");
      }
    }).catch((error) => {
      console.log("Error fetching data:", error);
    });
  };

  const FederationType = () => {
    const url = `/api/enum/FederationType`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              federationType: res.data,
            }
          });
        } else {
          console.log("No data found in API response.");
        }
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
      });
  };

   const Society = (BranchId: string) => {
    const url = `/api/group?BranchId=GRP2025052206325399069396&GroupType=Vendor&VendorType=SOCIETY&ApprovalStatus=APPROVED&IsActive=true`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              federation: res.data,
            }
          });
        } else {
          console.log("No data found in API response.");
        }
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
      });
  };



    const Paccs = (BranchId: string) => {
    const url = `/api/group?BranchId=GRP2025052206325399069396&GroupType=Vendor&VendorType=SOCIETY&ApprovalStatus=APPROVED&IsActive=true`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              federation: res.data,
            }
          });
        } else {
          console.log("No data found in API response.");
        }
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
      });
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
        } else {
          console.log("No data found in API response.");
        }
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
      });
  };

  const FpoandFpc = (federationId: string) => {
    console.log('Fetching FPO/FPC data for federationId:', federationId);
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
        } else {
          console.log("No data found in API response.");
        }
      })
      .catch((error) => {
        console.log("Error fetching FPO/FPC data:", error);
      });
  };


  const Storagelocation = (fpofpcId: string) => {
    const url = `/api/storagelocation?GroupId=${fpofpcId}&StorageType=NORMAL&LocationType=STORAGELOCATION&ApprovalStatus=PENDING&IsActive=true&CompanyId=`;
    apiClient.get(url)
      .then((res) => {
        console.log('stoargelocation', res.data);
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              storageLocation: res.data,
            }
          });
        } else {
          console.log("No data found in API response.");
        }
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
      });
  };

  return (
    <View style={styles.container}>
      <CommonPicker
        label="COMPANY NAME"
        selectedValue={state.form.option1 || ''}
        onValueChange={(value) => {
          updateState({
            form: {
              ...state.form,
              option1: value,
              option2: '', // Reset branch selection
              federationType: '', // Reset federation type selection
              option3: '' // Reset federation selection
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

      <CommonPicker
        label="Branch Name"
        selectedValue={state.form.option2 || ''}
        onValueChange={(value) => {
          updateState({
            form: {
              ...state.form,
              option2: value,
              federationType: '', // Reset federation type selection
              option3: '' // Reset federation selection
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
            },
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

      <CommonPicker
        label="Select Federation"
        selectedValue={state.form.option3 || ''}
        onValueChange={(value) => {
          console.log('Selected federation:', value);
          updateState({
            form: {
              ...state.form,
              option3: value,
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

      <CommonPicker
        label="Select FPO/FPC"
        selectedValue={state.form.fpofpcdata || ''}
        onValueChange={(value) => {

          console.log('fpo/fpc id', value);
          updateState({
            form: {
              ...state.form,
              fpofpcdata: value,
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



      <CommonPicker
        label="Select Storage"
        selectedValue={state.form.Storagedata || ''}
        onValueChange={(value) => {

          console.log('fpo/fpc id', value);
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  }
});

export default Warehousechecklist;