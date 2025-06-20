import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { launchCamera } from 'react-native-image-picker';
import * as Location from 'expo-location';

type ImageAsset = {
  uri: string;
  fileName: string;
  type: string;
  isScreenshot?: boolean;
  id: string;
};

const ReviewForm = () => {
  const [originalImages, setOriginalImages] = useState<ImageAsset[]>([]);
  const [screenshots, setScreenshots] = useState<ImageAsset[]>([]);
  const viewShotRefs = useRef<{[key: string]: ViewShot | null}>({});

  const capturePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      if (result.assets?.[0]) {
        const photo = result.assets[0];
        const imageId = `img-${Date.now()}`;
        
        const newImage = {
          uri: photo.uri || '',
          fileName: photo.fileName || `photo_${Date.now()}.jpg`,
          type: photo.type || 'image/jpeg',
          id: imageId
        };

        // Store original image for UI display
        setOriginalImages(prev => [...prev, newImage]);

        // Get location for overlay
        await fetchLocation();

        // Capture screenshot (will be posted to API)
        await captureScreenshot(imageId);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const captureScreenshot = async (imageId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const viewShotRef = viewShotRefs.current[imageId];
      if (!viewShotRef) return;

      const uri = await viewShotRef.capture();
      if (uri) {
        const screenshot = {
          uri,
          fileName: `screenshot_${Date.now()}.jpg`,
          type: 'image/jpeg',
          isScreenshot: true,
          id: `screenshot-${imageId}`
        };

        // Store screenshot for API submission
        setScreenshots(prev => [...prev, screenshot]);
      }
    } catch (error) {
      console.error('Screenshot error:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      // Add only screenshots to FormData
      screenshots.forEach(screenshot => {
        formData.append('Files', {
          uri: screenshot.uri,
          name: screenshot.fileName,
          type: screenshot.type
        } as any);
      });

      // Add other form data...
      formData.append('OtherField', 'value');

      // Submit to API
      const response = await apiClient.post('/api/endpoint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response.data);
      Alert.alert('Success', 'Form submitted successfully');
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to submit form');
    }
  };

  const renderImages = () => {
    return (
      <View style={styles.imagesContainer}>
        {originalImages.map((image) => (
          <View key={image.id} style={styles.imageWrapper}>
            <ViewShot 
              ref={ref => viewShotRefs.current[image.id] = ref}
              options={{ format: 'jpg', quality: 0.8 }}
              style={styles.hiddenViewShot}
            >
              <Image source={{ uri: image.uri }} style={styles.image} />
              {location && (
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>
                    Lat: {location.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.overlayText}>
                    Lng: {location.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </ViewShot>
            
            {/* Display only the original image in UI */}
            <Image source={{ uri: image.uri }} style={styles.visibleImage} />
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView>
      {/* Your form steps */}
      
      {/* Photo capture section */}
      <TouchableOpacity onPress={capturePhoto}>
        <Text>Take Photo</Text>
      </TouchableOpacity>

      {/* Display original images */}
      {renderImages()}

      {/* Submit button */}
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 10,
  },
  imageWrapper: {
    width: '48%',
    margin: '1%',
  },
  hiddenViewShot: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  visibleImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
  },
  overlayText: {
    color: 'white',
    fontSize: 10,
  },
});

export default ReviewForm;