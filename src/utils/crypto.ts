import CryptoJS from 'crypto-js';

const iv: string = 'QZ867SAYOF28QDAZ';

// Encrypt
export const encrypt = (text: string): string =>
    CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(iv), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();

// Decrypt
export const decrypt = (text: string): string => {
    const decrypted = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(iv), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
};

// base64 encrypt
export const base64Encrypt = (text: string): string => {
    const wordArray = CryptoJS.enc.Utf8.parse(text);
    return CryptoJS.enc.Base64.stringify(wordArray);
};

// base64 decrypt
export const base64Decode = (text: string): string => {
    const encodedWord = CryptoJS.enc.Base64.parse(text);
    return CryptoJS.enc.Utf8.stringify(encodedWord);
};
