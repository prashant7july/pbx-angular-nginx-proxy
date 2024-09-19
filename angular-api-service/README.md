## Docker CLI for typescript
```sh
docker run --rm -it -v "$PWD":/usr/src/app -w /usr/src/app -p 3000:3000 node:16 bash
npm install
npm start
```

## Development Database Server
```sh
Hostname - 103.163.40.130
Username - ccuser
Password - cloudVirAmiNag119
Database - cc_master
```

```sh
curl -X POST 'http://localhost:3000/auth/login' -H 'Content-Type: application/json' -H 'type: pbx' -d '{"user": {"username": "ccadmin2019","password":"@3iT1235","ip": "192.168.2.27"}}'
```

## Error 
```sh
Unhandled rejection Error: Host 'ectl-imsbkp.in' is not allowed to connect to this MySQL server
    at Packet.asError (/usr/src/app/node_modules/mysql2/lib/packets/packet.js:708:17)
    at ClientHandshake.execute (/usr/src/app/node_modules/mysql2/lib/commands/command.js:28:26)
    at Connection.handlePacket (/usr/src/app/node_modules/mysql2/lib/connection.js:408:32)
    at PacketParser.onPacket (/usr/src/app/node_modules/mysql2/lib/connection.js:70:12)
    at PacketParser.executeStart (/usr/src/app/node_modules/mysql2/lib/packet_parser.js:75:16)
    at Socket.<anonymous> (/usr/src/app/node_modules/mysql2/lib/connection.js:77:25)
    at Socket.emit (node:events:513:28)
    at addChunk (node:internal/streams/readable:315:12)
    at readableAddChunk (node:internal/streams/readable:289:9)
    at Socket.Readable.push (node:internal/streams/readable:228:10)
    at TCP.onStreamRead (node:internal/stream_base_commons:190:23)
```

## API Gateway Server
```sh
curl -X POST 'https://dev-ectl.cloud-connect.in:3001/api-gateway/login' -H 'Content-Type: application/json' -H 'type: crm' -d '{"user_type":"admin", "username":"ccadmin2019","password":"@3iT1235"}'
```

## Development Server
```sh
curl -X POST 'http://dev-ectl.cloud-connect.in:3000/auth/login' -H 'Content-Type: application/json' -H 'type: pbx' -d '{"user": {"username": "ccadmin2019","password":"@3iT1235","ip": "192.168.2.27"}}'

-- Proxy
curl -X POST 'http://localhost:8088/api/auth/login' -H 'Content-Type: application/json' -H 'type: pbx' -d '{"user": {"username": "ccadmin2019","password":"@3iT1235","ip": "192.168.2.27"}}'
```
# VAPT JIRA SERVER
## Login CURL API -
```sh
curl -X POST 'http://13.233.33.44:8088/auth/login' -H 'Content-Type: application/json' -H 'type: pbx' -d '{"user": {"username": "ccadmin2019","password":"@3iT1235","ip": "192.168.2.27"}}'
```

## [Reference Link](https://replit.com/@vivek1996offici/ElatedMinorArchitects#index.js)
## Decrypt API
```javascript
const CryptoJS = require("crypto-js");

// Use environment variables for security
const encryptionKey = process.env.ENCRYPTION_KEY || "01234567890123456789012345678901";
const encryptionIV = process.env.ENCRYPTION_IV || "0123456789012345";

function decryptRequest(encryptedData) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(encryptionKey),

      { iv: CryptoJS.enc.Utf8.parse(encryptionIV), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, }
    );

    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

    return JSON.parse(decryptedStr);
  } catch (error) { console.error("Decryption error:", error.message); throw new Error("Failed to decrypt the data. Please check the encryption key and data format."); }
}

// Example usage
const encryptedData = "paste your encrypted data"

try { const decryptedData = decryptRequest(encryptedData); console.log("Decrypted data:", decryptedData); }
catch (error) { console.error("Error:", error.message); }
```


