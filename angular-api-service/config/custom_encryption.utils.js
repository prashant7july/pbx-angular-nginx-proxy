var CryptoJS = require('crypto-js');
const config = require('../config/app');

const cipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

    return text => text.split('')
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join('');
}
    
const decipher = salt => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
      .map(hex => parseInt(hex, 16))
      .map(applySaltToChar)
      .map(charCode => String.fromCharCode(charCode))
      .join('');
}

const encryptAes = (string) => {
  return CryptoJS.AES.encrypt(string, config.appSecret).toString();
} 

const decryptAes = (password) => {
  const bytes = CryptoJS.AES.decrypt(password, config.appSecret)
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {
    cipher, decipher, encryptAes, decryptAes
};

