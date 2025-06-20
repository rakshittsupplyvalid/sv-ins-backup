import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { launchCamera } from 'react-native-image-picker';

type ImageUriType = {
  uri: string;
};

const ImageScreenshotComponent: React.FC = () => {
  const [imageUri, setImageUri] = useState<ImageUriType[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const viewShotRefs = useRef<Array<ViewShot | null>>([]);

  // Dummy location/address (replace with actual values or geolocation)
  const location = { latitude: 28.6139, longitude: 77.2090 };
  const address = true;
  const formattedAddress = 'Rajpath Marg, New Delhi, India';

  const handleCameraCapture = async () => {
  launchCamera({ mediaType: 'photo' }, (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorMessage) {
      Alert.alert('Error', response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
      const newImage = { uri: response.assets[0].uri! };
      const newIndex = imageUri.length;

      // Add image to list
      setImageUri((prev) => {
        const updatedList = [...prev, newImage];

        // Delay screenshot till image is rendered
        setTimeout(() => {
          captureSingleScreenshot(newIndex);
        }, 1000); // 1 second delay for ViewShot to mount

        return updatedList;
      });
    }
  });
};


  // Capture screenshot
  const captureSingleScreenshot = async (index: number) => {
    try {
      const ref = viewShotRefs.current[index];
      if (ref && typeof ref.capture === 'function') {
        const uri = await ref.capture();
        setScreenshots((prev) => [...prev, uri]); 
        console.log(`Screenshot ${index + 1}:`, uri);
        Alert.alert(`Screenshot ${index + 1}`, uri);
      }
    } catch (error) {
      console.error('Screenshot error:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.captureButton} onPress={handleCameraCapture}>
        <Text style={styles.captureButtonText}>Capture New Photo</Text>
      </TouchableOpacity>

      {imageUri.map((img, index) => (
        <View key={index} style={{ marginBottom: 20 }}>
          <ViewShot
            ref={(ref) => { viewShotRefs.current[index] = ref; }}
            options={{ format: 'jpg', quality: 1.0 }}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: img.uri }} style={styles.image} resizeMode="cover" />

              {/* Overlay for Location & Address */}
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


      <Text> Screenshot </Text>

      {screenshots.length > 0 && (
  <View style={{ marginTop: 20 }}>
    <Text style={{ fontWeight: 'bold' }}>Captured Screenshots:</Text>
    {screenshots.map((sUri, i) => (
      <Image
        key={i}
        source={{ uri: sUri }}
        style={{ width: 200, height: 130, marginVertical: 10 }}
      />
    ))}
  </View>
)}



    </ScrollView>
  );
};

export default ImageScreenshotComponent;






const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  imageContainer: {
    width: 300,
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
   
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 6,
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 12,
  },
  captureButton: {
    marginTop: 8,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
