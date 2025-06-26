
// import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
// import MMKVStorage from 'react-native-mmkv-storage';

// const storage = new MMKVStorage.Loader().initialize();

// declare module 'axios' {
//   interface AxiosRequestConfig {
//     skipEncryption?: boolean;
//   }
// }

// const apiClient = axios.create({
//   baseURL: 'https://stage-backend-2025.epravaha.com',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });


// apiClient.interceptors.request.use(
//   async (config) => {
//     try {
//       // Add authorization token if available
//       const token = await storage.getString('userToken');
//       if (token) {
//         config.headers = config.headers ?? {};
//         (config.headers as any).Authorization = `Bearer ${token}`;
//       }

//       // // Encryption logic
//       // if (config.data && !(config as any).skipEncryption) {
//       //   console.log('Original request data:', config.data);
//       //   const stringified = JSON.stringify(config.data);
//       //   const encrypted = encrypt(stringified);
//       //   console.log('Encrypted request data:', encrypted);

//       //   config.data = encrypted;
//       //   (config.headers as any)['IsEncrypted'] = 'true';
//       //   // Set content type
//       //   (config.headers as any)['Content-Type'] = 'application/octet-stream';
//       // }

//       return config;
//     } catch (error) {
//       console.error('Request interceptor error:', error);
//       return Promise.reject(new Error('Request processing failed'));
//     }
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// apiClient.interceptors.response.use(
//   (response: AxiosResponse) => {
//     try {
//       console.log('Original response data:', response.data);

//       const isEncrypted = response.headers?.['isencrypted'] === 'true';

//       if (isEncrypted && typeof response.data === 'string') {
//         // const decrypted = decrypt(response.data);
//         // console.log('Decrypted response:', decrypted);
//         // response.data = JSON.parse(decrypted);
//       }

//       return response;
//     } catch (error) {
//       console.error('Response interceptor error:', error);
//       return Promise.reject(new Error('Response processing failed'));
//     }
//   },
//   async (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       await storage.removeItem('userToken');
//       // Add navigation logic here if needed
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;



import axios from 'axios';
import jscrypto from '../../utils/jscrypto';
import { retrieveToken } from '../../utils/authUtils';

const  apiClient = axios.create({
    baseURL: 'https://dev-backend-2025.epravaha.com', // replace with your actual backend
    headers: {
        'Content-Type': 'application/octet-stream',
        'isencrypted': 'true',
        'accept': 'text/plain',
    },
});

// Request interceptor — encrypt request data
apiClient.interceptors.request.use(async (config) => {
  const token = retrieveToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = `${config.baseURL?.replace(/\/$/, '')}${config.url}`;
  console.log(`Hitting API: ${config.method?.toUpperCase()} ${fullUrl}`);

  // 🚫 Bypass encryption if FormData
  if (config.data instanceof FormData) {
    console.log('FormData detected, skipping encryption');
    config.headers['Content-Type'] = 'multipart/form-data';
    config.headers['Original-Content'] = 'multipart/form-data';
    config.headers['isencrypted'] = 'true';  // if your backend still expects this
    return config;
  }

  // ✅ Encrypt JSON or plain object
  if (config.data) {
    const rawData = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    const [encryptedData, contentType] = await jscrypto.encryptRequest(rawData);
    // console.log(`Encrypted Payload:`, encryptedData);

    config.data = encryptedData;
    config.headers['Content-Type'] = 'application/octet-stream';
    config.headers['Original-Content'] = contentType || 'application/json';
    config.headers['isencrypted'] = 'true';
  }

  return config;
});



// Response interceptor — decrypt response data
 apiClient.interceptors.response.use(

  
    async (response) => {
          console.log(`Response interceptor initialized`);
        console.log(`Received response for: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        console.log(`Response Data:`, response.data);
        const isEncrypted = response?.headers?.['isencrypted'] == 'True' || response?.headers?.['isencrypted'] == 'true';

        const originalContent = response?.headers?.['original-content'] || 'application/json' ;

        if (!isEncrypted) return response;

        try {
            const decryptedRes = await jscrypto.decryptResponse(response.data);
            console.log('\n =========== Encrypted Response: ========= \n', response?.data);
            console.log('\n =========== Decrypted Response: ========= \n', decryptedRes);
            response.data = decryptedRes
        } catch (err) {
            console.error('Decryption error:', err);
            return Promise.reject(err);
        }

        return response;
    },
    (error) => Promise.reject(error)
);

export default  apiClient;



// import axios from 'axios';
// import jscrypto from '../../utils/jscrypto';
// import Storage from '../../utils/Storage';

// const apiClient = axios.create({
//   baseURL: 'https://your-api-base-url.com',
//   timeout: 10000,
// });

// // Request interceptor
// apiClient.interceptors.request.use(async (config) => {
//   // Get token and attach
//   const token = Storage.getString('userToken');
//   if (token) {
//     config.headers['Authorization'] = `Bearer ${token}`;
//   }

//   // Skip encryption for multipart/form-data (FormData)
//   if (config.data && !(config.data instanceof FormData)) {
//     try {
//       const rawData =
//         typeof config.data === 'string'
//           ? config.data
//           : JSON.stringify(config.data);

//       const [encryptedData, contentType] = await jscrypto.encryptRequest(rawData);

//       config.data = encryptedData;
//       config.headers['Content-Type'] = 'application/octet-stream';
//       config.headers['Original-Content'] = contentType || 'application/json';
//       config.headers['isencrypted'] = 'true';

//     } catch (encryptionError) {
//       console.error('Encryption error:', encryptionError);
//       throw encryptionError;
//     }
//   }

//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// // Response interceptor (optional: for decryption)
// apiClient.interceptors.response.use(
//   async (response) => {
//     if (
//       response?.headers?.['isencrypted'] === 'true' &&
//       response?.data &&
//       typeof response.data === 'string'
//     ) {
//       try {
//         const decrypted = await jscrypto.decryptResponse(response.data);
//         return JSON.parse(decrypted);
//       } catch (decryptionError) {
//         console.error('Decryption failed:', decryptionError);
//         return Promise.reject(decryptionError);
//       }
//     }

//     return response;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default apiClient;







// import axios from 'axios';
// import jscrypto from '../../utils/jscrypto';
// import { retrieveToken } from '../../utils/authUtils';

// const apiClient = axios.create({
//   baseURL: 'https://dev-backend-2025.epravaha.com',
//   headers: {
//     'Content-Type': 'application/octet-stream',
//     isencrypted: 'true',
//     accept: 'text/plain',
//   },
// });

// // Request interceptor
// apiClient.interceptors.request.use(async (config) => {
//   // Get token synchronously (MMKV is sync by default)
//   const token = retrieveToken();
  
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   const fullUrl = `${config.baseURL?.replace(/\/$/, '')}${config.url}`;
//   console.log(`Calling API: ${config.method?.toUpperCase()} ${fullUrl}`);

//   if (config.data) {
//     const rawData = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
//     const [encryptedData, contentType] = await jscrypto.encryptRequest(rawData);

//     config.data = encryptedData;
//     config.headers['Content-Type'] = 'application/octet-stream';
//     config.headers['Original-Content'] = contentType || 'application/json';
//     config.headers['isencrypted'] = 'true';
//   }
//   return config;
// });

// // Response interceptor (unchanged, but with better error handling)
// apiClient.interceptors.response.use(
//   async (response) => {
//     const isEncrypted = response?.headers?.['isencrypted']?.toLowerCase() === 'true';
    
//     if (!isEncrypted) return response;

//        try {
//              const decryptedRes = await jscrypto.decryptResponse(response.data);
//              console.log('\n =========== Encrypted Response: ========= \n', response?.data);
//              console.log('\n =========== Decrypted Response: ========= \n', decryptedRes);
//              response.data = decryptedRes
//          } catch (err) {
//              console.error('Decryption error:', err);
//              return Promise.reject(err);
//          }


//     try {
//       const decryptedRes = await jscrypto.decryptResponse(response.data);
//       response.data = decryptedRes;
//     } catch (err) {
//       console.error('Decryption error:', err);
//       return Promise.reject(err);
//     }

//     return response;
//   },
//   (error) => {
//     // Handle token expiration (401 Unauthorized)
//     if (error.response?.status === 401) {
//       // Redirect to login or refresh token
//       console.log('Token expired - redirecting to login');
//       // Example: navigation.navigate('Login'); (if you have access to navigation)
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;

