// utils/encryptDecrypt.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'StghX9XV1geAqZIO5NU8OAZy5uy1gpLL'; // 32 characters
const IV = '2XNOLPME1WBRE34D'; // 16 characters

const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
const iv = CryptoJS.enc.Utf8.parse(IV);

function encrypt(message: string): string {
  if (!message) return message;
  
  try {
    const encrypted = CryptoJS.AES.encrypt(message, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

function decrypt(message: string): string {
  if (!message) return message;
  
  try {
    const decrypted = CryptoJS.AES.decrypt(message, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error('Decryption returned empty result');
    }
    
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
}

export { encrypt, decrypt };