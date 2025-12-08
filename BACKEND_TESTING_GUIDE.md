# Backend API Testing Guide

> Complete guide to test all backend endpoints after authentication is working

---

## Prerequisites

✅ Backend running: `php artisan serve` (http://127.0.0.1:8000)  
✅ Frontend running: `npm run dev` (http://localhost:5173)  
✅ Both tenants created: ACME and GLOBEX  
✅ Users seeded with test credentials  

---

## Step 1: Get Authentication Token

**Option A: Using Frontend Login**
1. Visit http://localhost:5173
2. Select ACME tenant
3. Login with: `admin@tenant.com` / `password123`
4. Open Browser DevTools → Storage → localStorage
5. Copy the value of `authToken`

**Option B: Using Postman/cURL**
```bash
curl -X POST http://acme.localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tenant.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "1|7frK3oylKQODkrwSMhcQKReBlYIVvL...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@tenant.com",
    "role": "admin"
  },
  "tenant": "acme"
}
```

**Copy the token value - you'll use it for all subsequent requests**

---

## Step 2: Test Authentication Endpoints

### Test Current User Info
```bash
curl -X GET http://acme.localhost:8000/api/v1/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK with user data

### Test Logout
```bash
curl -X POST http://acme.localhost:8000/api/v1/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK with success message

---

## Step 3: Test CRUD Endpoints (Products, Orders, Customers, Stocks)

### Products - List All
```bash
curl -X GET http://acme.localhost:8000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK with paginated products array

### Products - Create New
```bash
curl -X POST http://acme.localhost:8000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 99.99,
    "sku": "TEST-001"
  }'
```

Expected: ✅ 201 Created with product data

### Products - Get Single
```bash
curl -X GET http://acme.localhost:8000/api/v1/products/{product_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK with product data

### Products - Update
```bash
curl -X PUT http://acme.localhost:8000/api/v1/products/{product_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "price": 149.99
  }'
```

Expected: ✅ 200 OK with updated product

### Products - Delete
```bash
curl -X DELETE http://acme.localhost:8000/api/v1/products/{product_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK (or 204 No Content)

---

## Step 4: Test Orders Endpoints

### Orders - List All
```bash
curl -X GET http://acme.localhost:8000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK with orders array

### Orders - Create New
```bash
curl -X POST http://acme.localhost:8000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUSTOMER_UUID",
    "status": "pending",
    "total_amount": 299.99,
    "items": [
      {
        "product_id": "PRODUCT_UUID",
        "quantity": 2,
        "price": 99.99
      }
    ]
  }'
```

Expected: ✅ 201 Created

### Orders - Get Single
```bash
curl -X GET http://acme.localhost:8000/api/v1/orders/{order_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK with order details

---

## Step 5: Test Customers Endpoints

### Customers - List All
```bash
curl -X GET http://acme.localhost:8000/api/v1/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK

### Customers - Create
```bash
curl -X POST http://acme.localhost:8000/api/v1/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "address": "123 Main St"
  }'
```

Expected: ✅ 201 Created

---

## Step 6: Test Stocks Endpoints

### Stocks - List All
```bash
curl -X GET http://acme.localhost:8000/api/v1/stocks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK

---

## Step 7: Test Multi-Tenant Isolation

### Get Token for GLOBEX
```bash
curl -X POST http://globex.localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tenant.com",
    "password": "password123"
  }'
```

### Test ACME Token on GLOBEX Domain
```bash
# Using ACME token on GLOBEX domain
curl -X GET http://globex.localhost:8000/api/v1/products \
  -H "Authorization: Bearer ACME_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ❌ 401 Unauthorized (ACME token doesn't work on GLOBEX)

### Test GLOBEX Token on GLOBEX Domain
```bash
# Using GLOBEX token on GLOBEX domain
curl -X GET http://globex.localhost:8000/api/v1/products \
  -H "Authorization: Bearer GLOBEX_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: ✅ 200 OK with GLOBEX products (isolated from ACME)

---

## Testing Checklist

### Authentication
- [ ] Login returns token
- [ ] GET /me returns current user
- [ ] Logout revokes token
- [ ] Accessing protected route without token returns 401

### Products
- [ ] List all products (GET)
- [ ] Create product (POST)
- [ ] Get single product (GET)
- [ ] Update product (PUT)
- [ ] Delete product (DELETE)

### Orders
- [ ] List all orders (GET)
- [ ] Create order (POST)
- [ ] Get order details (GET)
- [ ] Update order (PUT) - if implemented
- [ ] Delete order (DELETE) - if implemented

### Customers
- [ ] List all customers (GET)
- [ ] Create customer (POST)
- [ ] Get customer (GET)
- [ ] Update customer (PUT)
- [ ] Delete customer (DELETE)

### Stocks
- [ ] List all stocks (GET)
- [ ] Create stock (POST)
- [ ] Get stock (GET)
- [ ] Update stock (PUT)
- [ ] Delete stock (DELETE)

### Multi-Tenancy
- [ ] ACME user can only see ACME data
- [ ] GLOBEX user can only see GLOBEX data
- [ ] ACME token doesn't work on GLOBEX domain
- [ ] GLOBEX token doesn't work on ACME domain

### Frontend Integration
- [ ] Frontend login works
- [ ] Products list loads after login
- [ ] Can create/edit/delete through frontend
- [ ] Logout clears token
- [ ] Refresh maintains session (token from localStorage)

---

## Common Issues & Solutions

### Issue: 401 Unauthorized on Protected Routes
**Cause:** Token not being sent or expired  
**Solution:**
1. Check token is in Authorization header: `Bearer {token}`
2. Login again to get fresh token
3. Check token in localStorage (frontend)

### Issue: 404 Not Found on Endpoints
**Cause:** Wrong URL or endpoint not registered  
**Solution:**
1. Check domain: acme.localhost vs globex.localhost
2. Verify route is in tenant.php
3. Check request path: should be `/api/v1/...`

### Issue: CORS Error
**Cause:** Frontend making request to wrong domain  
**Solution:**
1. Use correct tenant domain (acme.localhost or globex.localhost)
2. axiosClient should have correct baseURL set
3. Check EnableCorsMiddleware is applied

### Issue: Data from Wrong Tenant
**Cause:** Tenant isolation not working  
**Solution:**
1. Verify InitializeTenancyByDomain middleware is active
2. Check tenant context is being read from domain
3. Ensure you're using correct tenant domain for requests

---

## Using Postman

Instead of cURL, you can use the provided `Storemate_Auth_API.postman_collection.json`:

1. Import collection in Postman
2. Create environment variables:
   - `acme_token` = token from ACME login
   - `globex_token` = token from GLOBEX login
   - `acme_url` = http://acme.localhost:8000/api/v1
   - `globex_url` = http://globex.localhost:8000/api/v1
3. Use variables in requests: `{{acme_url}}/products`
4. Set Authorization header: `Bearer {{acme_token}}`

---

## Next Steps

Once all endpoints are tested and working:

1. ✅ Frontend should consume these endpoints
2. ✅ Products page loads from GET /products
3. ✅ Create product form sends to POST /products
4. ✅ Edit/delete use PUT/DELETE endpoints
5. ✅ Orders, Customers, Stocks follow same pattern

**All data should be tenant-isolated and require valid token**

---

**Last Updated:** December 8, 2025  
**Status:** Ready for Testing
