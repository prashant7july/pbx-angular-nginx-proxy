## API Gateway Server
```sh
curl -X POST 'https://dev-ectl.cloud-connect.in:3001/api-gateway/login' -H 'Content-Type: application/json' -H 'type: crm' -d '{"user_type":"admin", "username":"ccadmin2019","password":"@3iT1235"}'
```

## Development Server the base URL set in `environment.ts`
```sh
curl -X POST 'http://dev-ectl.cloud-connect.in:3000/auth/login' -H 'Content-Type: application/json' -H 'type: pbx' -d '{"user": {"username": "ccadmin2019","password":"@3iT1235","ip": "192.168.2.27"}}'
```

## VAPT JIRA Server the base URL also set in `environment.ts` too
```sh
curl -X POST 'http://13.233.33.44:8088/auth/login' -H 'Content-Type: application/json' -H 'type: pbx' -d '{"user": {"username": "ccadmin2019","password":"@3iT1235","ip": "192.168.2.27"}}'
```

## Docker Run in Development Server after `environment.ts` change
```javascript
export const environment = {
  production: false,
  api_url: 'http://dev-ectl.cloud-connect.in:3000/',
  backend_service_api_url: 'http://dev-ectl.cloud-connect.in:3000/'
};
```