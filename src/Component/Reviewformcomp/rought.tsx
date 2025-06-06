const generateAndSavePDF = async () => {
  if (!inspectionData) {
    Alert.alert('Error', 'No inspection data available');
    return;
  }

  try {
    // Generate PDF (your existing code)
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      // ... your existing print options
    });

    // Define save location
    const pdfName = `Inspection_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    
    if (Platform.OS === 'android') {
      // Android: Save directly to Downloads folder
      const downloadsDir = FileSystem.documentDirectory + 'Download/';
      
      // Ensure Download directory exists
      await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
      
      const newPath = downloadsDir + pdfName;
      await FileSystem.copyAsync({
        from: uri,
        to: newPath
      });
      
      Alert.alert(
        'PDF Saved', 
        `File saved to Downloads folder: ${pdfName}`,
        [
          { text: 'Open', onPress: () => Sharing.shareAsync(newPath) },
          { text: 'OK' }
        ]
      );
    } else {
      // iOS: Save to app's document directory
      const newPath = FileSystem.documentDirectory + pdfName;
      await FileSystem.copyAsync({
        from: uri,
        to: newPath
      });
      
      Alert.alert(
        'PDF Saved', 
        'File saved to app documents',
        [
          { text: 'Share', onPress: () => Sharing.shareAsync(newPath) },
          { text: 'OK' }
        ]
      );
    }

    // Clean up temporary file
    await FileSystem.deleteAsync(uri, { idempotent: true });

  } catch (error) {
    console.error('PDF save failed:', error);
    Alert.alert('Error', 'Failed to save PDF. Please try again.');
  }
};