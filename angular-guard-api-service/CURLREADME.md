curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin"}'

curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username": "tenant"}'

curl -X GET http://localhost:3000/api/admin/internal-users \
    -H "Authorization: Bearer your_generated_jwt_token"

curl -X GET http://localhost:3000/api/tenant/data \
    -H "Authorization: Bearer your_generated_jwt_token"

curl -X GET http://localhost:3000/api/tenant/only \
    -H "Authorization: Bearer your_generated_jwt_token"

{"message":"Access denied: Insufficient privileges"} - If I used the admin token


curl -X POST http://localhost:8080/api/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin"}'