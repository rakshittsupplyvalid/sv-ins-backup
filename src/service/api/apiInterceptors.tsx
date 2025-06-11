// src/services/apiClient.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import MMKVStorage from 'react-native-mmkv-storage';
import { encrypt, decrypt } from '../../utils/encryptDecrypt';

const storage = new MMKVStorage.Loader().initialize();

declare module 'axios' {
  interface AxiosRequestConfig {
    skipEncryption?: boolean;
  }
}

const apiClient = axios.create({
  baseURL: 'https://dev-backend-2025.epravaha.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Add authorization token if available
      const token = await storage.getString('userToken');
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }

      // // Encryption logic
      // if (config.data && !(config as any).skipEncryption) {
      //   console.log('Original request data:', config.data);
      //   const stringified = JSON.stringify(config.data);
      //   const encrypted = encrypt(stringified);
      //   console.log('Encrypted request data:', encrypted);

      //   config.data = encrypted;
      //   (config.headers as any)['IsEncrypted'] = 'true';
      //   // Set content type
      //   (config.headers as any)['Content-Type'] = 'application/octet-stream';
      // }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(new Error('Request processing failed'));
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    try {
      console.log('Original response data:', response.data);

      const isEncrypted = response.headers?.['isencrypted'] === 'true';

      if (isEncrypted && typeof response.data === 'string') {
        const decrypted = decrypt(response.data);
        console.log('Decrypted response:', decrypted);
        response.data = JSON.parse(decrypted);
      }

      return response;
    } catch (error) {
      console.error('Response interceptor error:', error);
      return Promise.reject(new Error('Response processing failed'));
    }
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await storage.removeItem('userToken');
      // Add navigation logic here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;


// ==================== FIXING ======================
// src/services/apiClient.ts
// import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
// import MMKVStorage from 'react-native-mmkv-storage';
// import { encrypt, decrypt } from '../../utils/encryptDecrypt';

// // Storage setup
// const storage = new MMKVStorage.Loader().initialize();

// // Add custom field to axios config for skipping encryption when needed
// declare module 'axios' {
//   interface AxiosRequestConfig {
//     skipEncryption?: boolean;
//   }
//  }

// const apiClient = axios.create({
//   baseURL: 'https://dev-backend-2025.epravaha.com',
//   headers: {
//     accept: 'text/plain',
//     'Content-Type': 'application/json', // will be overridden if encryption is used
//   },
// });

// // ===================== REQUEST INTERCEPTOR ======================
// apiClient.interceptors.request.use(
//   async (config) => {
//     try {
//       config.headers = config.headers ?? {};

//       // Token - curl uses Bearer null
//       const token = await storage.getString('userToken');
//       config.headers['Authorization'] = `Bearer ${token ?? 'null'}`;

//       // Only encrypt POST/PUT with body
//       if (config.data && !config.skipEncryption) {
//         const hardcodedPayload =
//           '4Wwj7lVbwIMojSa+bGmMEFRlhmi08sJcUKxesi79nNouj1J6NMFVB7tiQa+qm4z+Bxp2XF7NiG564CKdh6J6cyFHfaCWV8AbpLAMW2+mi/4=';

//         config.data = hardcodedPayload;

//         config.headers['Content-Type'] = 'application/octet-stream';
//         config.headers['IsEncrypted'] = 'true';
//         config.headers['accept'] = 'text/plain';

//         // 💥 CRITICAL: Prevent Axios from modifying data
//         config.transformRequest = [(data) => data];
//       }

//       return config;
//     } catch (err) {
//       console.error('Request interceptor error:', err);
//       return Promise.reject(err);
//     }
//   },
//   (error: AxiosError) => Promise.reject(error)
// );


// // ===================== RESPONSE INTERCEPTOR ======================
// apiClient.interceptors.response.use(
//   (response: AxiosResponse) => {
//     try {
//       const isEncrypted = response.headers?.['isencrypted'] === 'true';
//       console.log("Sandeep",response)

//       if (isEncrypted && typeof response.data === 'string') {
//         const decrypted = decrypt(response.data);
//         console.log('Decrypted response:', decrypted);
//         response.data = JSON.parse(decrypted);
//       } else {
//         console.log('Plain response:', response.data);
//       }

//       return response;
//     } catch (error) {
//       console.error('Response error:', error);
//       return Promise.reject(error);
//     }
//   },
//   async (error: AxiosError) => {
//     // Token expired or unauthorized
//     if (error.response?.status === 401) {
//       await storage.removeItem('userToken');
//       // Optionally trigger logout navigation
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiClient;