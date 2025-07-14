// import AES from 'react-native-aes-crypto';
// import { getRandomBytesAsync } from 'expo-crypto'; // Correct usage
// import { encode as btoa } from 'base-64';

// const jscrypto = {
//   key: 'StghX9XV1geAqZIO5NU8OAZy5uy1gpLL', // 32-char AES key (256-bit)

//   async getKey() {
//     return this.key;
//   },

//   async generateIV() {
//     const ivBytes = await getRandomBytesAsync(16); // 16 bytes for AES-CBC
//     return ivBytes
//       .map((byte) => byte.toString(16).padStart(2, '0'))
//       .join('');
//   },

//   async encryptRequest(data) {
//     const key = await this.getKey();
//     const iv = await this.generateIV();

//     const contentType = 'application/json';
//     const stringData = typeof data === 'string' ? data : JSON.stringify(data);

//     const encrypted = await AES.encrypt(stringData, key, iv, 'aes-256-cbc');
//     const combined = iv + encrypted; // prepend IV

//     return [combined, contentType];
//   },

//   async decrypt(data) {
//     const key = await this.getKey();
//     const iv = data.slice(0, 32); // First 32 hex chars = 16 bytes IV
//     const encrypted = data.slice(32);

//     const decryptedText = await AES.decrypt(encrypted, key, iv, 'aes-256-cbc');

//     try {
//       return JSON.parse(decryptedText);
//     } catch {
//       return decryptedText;
//     }
//   },
// };

// export default jscrypto;



import 'react-native-get-random-values'; // polyfill first
import CryptoJS from 'crypto-js';

class jscrypto {
  key = 'StghX9XV1geAqZIO5NU8OAZy5uy1gpLL';

  encryptRequest(data) {
    const ivArray = new Uint8Array(16);
    crypto.getRandomValues(ivArray); // ✅ now works due to polyfill

    const iv = CryptoJS.lib.WordArray.create(ivArray);
    const encrypted = CryptoJS.AES.encrypt(
      typeof data === 'string' ? data : JSON.stringify(data),
      CryptoJS.enc.Utf8.parse(this.key),
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const combined = iv.concat(encrypted.ciphertext);
    const base64Payload = CryptoJS.enc.Base64.stringify(combined);
    return [base64Payload, 'application/json'];
  }

  decryptResponse(base64Data) {
    const rawData = CryptoJS.enc.Base64.parse(base64Data);
    const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4), 16);
    const ciphertext = CryptoJS.lib.WordArray.create(
      rawData.words.slice(4),
      rawData.sigBytes - 16
    );

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext },
      CryptoJS.enc.Utf8.parse(this.key),
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedText);
  }
}

export default new jscrypto();

