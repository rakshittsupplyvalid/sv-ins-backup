// ... (previous imports remain the same)

const InspectionListDetails = () => {
  // ... (previous state declarations remain the same)
  
  const [isEditingBin, setIsEditingBin] = useState(false); // Add this state

  const openEditModal = (item: any, isBin: boolean = false) => {
    setSelectedChawlCode(item.code);
    setIsEditingBin(isBin); // Set whether we're editing a bin
    
    if (isBin) {
      // For bins, only show radius and height
      setEditForm({
        length: '',
        breadth: '',
        height: item.height.toString(),
        radius: item.radius?.toString() || ''
      });
    } else {
      // For chawls, show length, breadth, and height
      setEditForm({
        length: item.length.toString(),
        breadth: item.breadth.toString(),
        height: item.height.toString(),
        radius: ''
      });
    }
    
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedChawlCode('');
    setIsEditingBin(false);
    setEditForm({
      length: '',
      breadth: '',
      height: '',
      radius: ''
    });
  };

  const updateChawlSize = async () => {
    if (!selectedChawlCode) {
      Alert.alert('Error', 'No item selected');
      return;
    }

    const formData = new FormData();
    formData.append('ChawlType', chawlType);
    formData.append('id', selectedChawlCode.toString());
    
    if (isEditingBin) {
      // For bins, only send radius and height
      formData.append('Radius', Number(editForm.radius).toString());
      formData.append('Height', Number(editForm.height).toString());
    } else {
      // For chawls, send length, breadth, and height
      formData.append('Length', Number(editForm.length).toString());
      formData.append('Breadth', Number(editForm.breadth).toString());
      formData.append('Height', Number(editForm.height).toString());
    }
    
    formData.append('EditComment', comment);

    const apiUrl = `/api/InspectionReport/update/${selectedChawlCode}/ChawlSize`;

    try {
      const response = await apiClient.put(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Item updated successfully');
      setEditForm({ length: '', breadth: '', height: '', radius: '' });
      setComment('');
      setSelectedChawlCode('');
      setIsEditingBin(false);
      setEditModalVisible(false);

      // Refresh the inspection data
      const refreshResponse = await apiClient.get(`/api/InspectionReport/${id}`);
      setInspectionData(refreshResponse.data);
    } catch (error: any) {
      console.error('Error updating item:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  // ... (rest of the component remains the same until the JSX part)

  return (
    <ScrollView style={styles.container}>
      {/* ... (other JSX remains the same) */}

      {/* Chawl Sizes */}
      {expandedSection === 'chawl' && inspectionData.chawlSizes?.map((chawl: any, index: number) => (
        <View key={chawl.code} style={styles.dataCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Chawl {index + 1}</Text>
            <TouchableOpacity
              onPress={() => openEditModal(chawl, false)} // Pass false for isBin
              style={styles.editButton}
            >
              <Icon name="edit" size={18} color="#4e8cff" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardRow}>
            <DetailItem icon="straighten" label="Type" value={chawl.chawlType} />
            <DetailItem icon="height" label="Length" value={chawl.length} />
          </View>
          <View style={styles.cardRow}>
            <DetailItem icon="width-full" label="Breadth" value={chawl.breadth} />
            <DetailItem icon="height" label="Height" value={chawl.height} />
          </View>
          <DetailItem icon="layers" label="Quantity" value={chawl.quantity} />
        </View>
      ))}

      {/* Bin Sizes */}
      {expandedSection === 'bin' && inspectionData.binsSizes?.map((bin: any, index: number) => {
        const calculatedQuantity = ((3.14159 * Math.pow(Number(bin.radius), 2) * Number(bin.height) * 20) / 1000).toFixed(2);

        return (
          <View key={index} style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Bin {index + 1}</Text>
              <TouchableOpacity
                onPress={() => openEditModal(bin, true)} // Pass true for isBin
                style={styles.editButton}
              >
                <Icon name="edit" size={18} color="#4e8cff" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardRow}>
              <DetailItem icon="circle" label="Radius" value={bin.radius} />
              <Text></Text>
              <DetailItem icon="height" label="Height" value={bin.height} />
            </View>

            <DetailItem icon="layers" label="Quantity (MT)" value={calculatedQuantity} />
          </View>
        );
      })}

      {/* ... (other JSX remains the same) */}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditingBin ? 'Edit Bin Size' : 'Edit Chawl Size'}
              </Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Icon name="close" size={24} color="#495057" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chawl Type</Text>
                <Picker
                  selectedValue={chawlType}
                  style={styles.dropdown}
                  onValueChange={(itemValue) => setChawltype(itemValue)}>
                  <Picker.Item label="Select Chawl Type" value="" />
                  <Picker.Item label="None" value="None" />
                  <Picker.Item label="Chawl" value="Chawl" />
                  <Picker.Item label="Bin" value="Bin" />
                </Picker>
              </View>

              {!isEditingBin ? (
                // Show length and breadth fields for chawls
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Length</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm.length}
                      onChangeText={(text) => handleInputChange('length', text)}
                      keyboardType="numeric"
                      placeholder="Enter length"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Breadth</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm.breadth}
                      onChangeText={(text) => handleInputChange('breadth', text)}
                      keyboardType="numeric"
                      placeholder="Enter breadth"
                    />
                  </View>
                </>
              ) : (
                // Show radius field for bins
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Radius</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.radius}
                    onChangeText={(text) => handleInputChange('radius', text)}
                    keyboardType="numeric"
                    placeholder="Enter radius"
                  />
                </View>
              )}

              {/* Height field for both chawls and bins */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.height}
                  onChangeText={(text) => handleInputChange('height', text)}
                  keyboardType="numeric"
                  placeholder="Enter height"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Comments</Text>
                <TextInput
                  style={styles.input}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Enter Comments"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeEditModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateChawlSize}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ... (rest of the JSX remains the same) */}
    </ScrollView>
  );
};

// ... (rest of the code remains the same)