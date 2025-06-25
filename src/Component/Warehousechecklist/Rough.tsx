import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CommonPicker from '../../CommonCompoent/CommonPicker';
import apiClient from '../../service/api/apiInterceptors';
import useForm from '../../Common/UseForm';

const Warehousechecklist = () => {
  const { state, updateState } = useForm();

  useEffect(() => {

    companyDropdown();
    // FederationType();
  }, []);

  useEffect(() => {
    if (state.form.companydata) {
      BranchDropdown(state.form.companydata);
    }
  }, [state.form.companydata]);



  // useEffect(() => {
  //   if(state.form.branchdata){
  //         Federation(state.form.branchdata);
  //   }

  // }, [state.form.branchdata]);

  // useEffect(() => {
  //   if (state.form.federation) {
  //     FpoandFpc(state.form.federation);
  //   }
  // }, [state.form.federation]);

  // useEffect(() => {
  //   if (state.form.fpofpc) {
  //     Storagelocation(state.form.fpofpc);
  //   }
  // }, [state.form.fpofpc]);

  const companyDropdown = () => {
    const url = `/api/dropdown/company`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
          updateState({
            fielddata: {
              ...state.fielddata,
              company: res.data,
              branch : null
              
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

  const BranchDropdown = (companyId: string) => {
    
    const url = `/api/group?CompanyId=${companyId}&GroupType=Branch&BranchType=PROCURING&BranchType=BOTH&ApprovalStatus=APPROVED&IsActive=true`;
    apiClient.get(url)
      .then((res) => {
        if (res?.data) {
      
          updateState({
            fielddata: {
              ...state.fielddata,
              branch: res.data,
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

  // const FederationType = () => {
  //   const url = `/api/enum/FederationType`;
  //   apiClient.get(url)
  //     .then((res) => {
  //       if (res?.data) {
  //         updateState({
  //           fielddata: {
  //             ...state.fielddata,
  //             federationType: res.data,
  //           }
  //         });
  //       } else {
  //         console.log("No data found in API response.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching data:", error);
  //     });
  // };

  // const Federation = (BranchId : string) => {
  //     console.log('Calling BranchId:', BranchId);

  //   const url = `/api/group?FederationType=FEDERATION&GroupBy=FEDERATION&ApprovalStatus=APPROVED&BranchId=${BranchId}`;
  //   apiClient.get(url)
  //     .then((res) => {
  //       if (res?.data) {
  //         updateState({
  //           fielddata: {
  //             ...state.fielddata,
  //             federation: res.data,
  //           }
  //         });
  //       } else {
  //         console.log("No data found in API response.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching data:", error);
  //     });
  // };

  // const FpoandFpc = (federationId: string) => {
  //   const url = `/api/group?VendorType=FPC&VendorType=FPO&FederationId=${federationId}`;
  //   apiClient.get(url)
  //     .then((res) => {
  //       if (res?.data) {
  //         updateState({
  //           fielddata: {
  //             ...state.fielddata,
  //             fpofpc: res.data,
  //           }
  //         });
  //       } else {
  //         console.log("No data found in API response.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching data:", error);
  //     });
  // };


  // const Society = () => {
  //   const url = `/api/group?BranchId=GRP2025052206325399069396&GroupType=Vendor&VendorType=SOCIETY&ApprovalStatus=APPROVED&IsActive=true`;
  //   apiClient.get(url)
  //     .then((res) => {
  //       if (res?.data) {
  //         updateState({
  //           fielddata: {
  //             ...state.fielddata,
  //             Societydata: res.data,
  //           }
  //         });
  //       } else {
  //         console.log("No data found in API response.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching data:", error);
  //     });
  // };

  // const Storagelocation = (fpofpcId: string) => {
  //   const url = `/api/storagelocation?GroupId=${fpofpcId}&StorageType=NORMAL&LocationType=STORAGELOCATION&ApprovalStatus=PENDING&IsActive=true&CompanyId=`;
  //   apiClient.get(url)
  //     .then((res) => {
  //       if (res?.data) {
  //         updateState({
  //           fielddata: {
  //             ...state.fielddata,
  //             storageLocation: res.data,
  //           }
  //         });
  //       } else {
  //         console.log("No data found in API response.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching data:", error);
  //     });
  // };

  return (
    <View style={styles.container}>
      <CommonPicker
        label="Company Name"
        selectedValue={state.form.companydata}
        onValueChange={(value) => {
           


          updateState({
            form: {
              ...state.form,
              companydata: value,

            },
          });
        }}
        items={[
          { label: 'Select Company Name', value: '' },
          ...(state.fielddata.company?.map((item: { text: string; value: string }) => ({
            label: item.text,
            value: item.value,
          })) || [])
        ]}
      />

      <CommonPicker
        label="Branch Name"
        selectedValue={state.form.branchdata}
        onValueChange={(value) => {
        console.log('Selected Branch ID:', value);

          updateState({
            form: {
              ...state.form,
              branchdata: value,
            },
          });
        }}
        items={[
          { label: 'Select Branch Name', value: '' },
          ...(state.fielddata.branch?.map((item: { name: string; value: string }) => ({
            label: item.name,
            value: item.value,
          })) || [])
        ]}
      />

{/* 
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
        selectedValue={state.form.federation}
        onValueChange={(value) => {
          updateState({
            form: {
              ...state.form,
              federation: value,
              fpofpc: '',
            },
          });
        }}
        items={[
          { label: 'Select Federation', value: '' },
          ...(state.fielddata.federation?.map((item: { name: string; value: string }) => ({
            label: item.name,
            value: item.value,
          })) || [])
        ]}
      />

      <CommonPicker
        label="Select Fpo and Fpc"
        selectedValue={state.form.fpofpc}
        onValueChange={(value) => {
          updateState({
            form: {
              ...state.form,
              fpofpc: value,
            },
          });
        }}
        items={[
          { label: 'Select Fpo and Fpc', value: '' },
          ...(state.fielddata.fpofpc?.map((item: { name: string; value: string }) => ({
            label: item.name,
            value: item.value,
          })) || [])
        ]}
      /> */}
    </View>




  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  }
});

export default Warehousechecklist;
