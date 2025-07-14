

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
            console.log('\n ========= Encrypted Response: ====== \n', response?.data);
            console.log('\n ========= Decrypted Response: ====== \n', decryptedRes);
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


