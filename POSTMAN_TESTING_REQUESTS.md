# Postman Testing - Complete API Endpoints

> Copy-paste ready requests for testing all endpoints

---

## Setup in Postman

### 1. Create an Environment Variable
- Click: **Environments** (left panel)
- Click: **+ Create New**
- Name: `Storemate`
- Add variables:

| Variable | Value | Scope |
|----------|-------|-------|
| `acme_token` | (leave blank, fill after login) | Global |
| `globex_token` | (leave blank, fill after login) | Global |
| `acme_url` | http://acme.localhost:8000/api/v1 | Global |
| `globex_url` | http://globex.localhost:8000/api/v1 | Global |

### 2. Select the Environment
- Top right dropdown: select `Storemate`

---

## ACME Tenant - Complete Test Flow

### 1️⃣ Login to ACME

**Method:** `POST`  
**URL:** `{{acme_url}}/login`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@tenant.com",
  "password": "password123"
}
```

**Expected Response:** ✅ 200 OK
```json
{
  "success": true,
  "message": "Login successful",
  "token": "1|7frK3oylKQODkrwSMhcQKReBlYIVvL...",
  "user": {
    "id": "a08af3d0-0603-4b61-b801-d3225e33713b",
    "name": "Admin User",
    "email": "admin@tenant.com",
    "role": "admin"
  },
  "tenant": "acme"
}
```

**After Response:**
1. Copy the `token` value (entire string: `1|7fr...`)
2. Right-click response → Set: `acme_token`
3. Or manually: Click **Environments** → paste token in `acme_token` variable

---

### 2️⃣ Get Current User (Verify Token)

**Method:** `GET`  
**URL:** `{{acme_url}}/me`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK
```json
{
  "success": true,
  "user": {
    "id": "a08af3d0-0603-4b61-b801-d3225e33713b",
    "name": "Admin User",
    "email": "admin@tenant.com",
    "role": "admin"
  },
  "tenant": "acme"
}
```

---

## PRODUCTS ENDPOINTS

### 3️⃣ GET All Products

**Method:** `GET`  
**URL:** `{{acme_url}}/products`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK
```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Product 1",
      "description": "...",
      "price": 99.99,
      "sku": "SKU-001",
      "stocks": []
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

**If empty:** ✅ 200 OK with `"data": []` is fine, means no products yet

---

### 4️⃣ CREATE New Product

**Method:** `POST`  
**URL:** `{{acme_url}}/products`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Test Laptop",
  "description": "A high-performance laptop for testing",
  "price": 1299.99,
  "sku": "LAPTOP-TEST-001"
}
```

**Expected Response:** ✅ 201 Created
```json
{
  "id": "uuid-new",
  "name": "Test Laptop",
  "description": "A high-performance laptop for testing",
  "price": 1299.99,
  "sku": "LAPTOP-TEST-001",
  "created_at": "2025-12-08T...",
  "updated_at": "2025-12-08T..."
}
```

**Save the `id` value** - you'll need it for next requests

---

### 5️⃣ GET Single Product

**Method:** `GET`  
**URL:** `{{acme_url}}/products/{product_id}`

Replace `{product_id}` with the ID from step 4

**Example:** `{{acme_url}}/products/550e8400-e29b-41d4-a716-446655440000`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK
```json
{
  "id": "product_id",
  "name": "Test Laptop",
  "price": 1299.99,
  "stocks": []
}
```

---

### 6️⃣ UPDATE Product

**Method:** `PUT`  
**URL:** `{{acme_url}}/products/{product_id}`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Test Laptop Updated",
  "description": "Updated description",
  "price": 1199.99,
  "sku": "LAPTOP-TEST-001-V2"
}
```

**Expected Response:** ✅ 200 OK
```json
{
  "id": "product_id",
  "name": "Test Laptop Updated",
  "price": 1199.99,
  "updated_at": "2025-12-08T..."
}
```

---

### 7️⃣ DELETE Product

**Method:** `DELETE`  
**URL:** `{{acme_url}}/products/{product_id}`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK or 204 No Content
```json
{
  "message": "Product deleted successfully"
}
```

---

## CUSTOMERS ENDPOINTS

### 8️⃣ GET All Customers

**Method:** `GET`  
**URL:** `{{acme_url}}/customers`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK
```json
{
  "data": [],
  "meta": { "current_page": 1, "per_page": 20, "total": 0 }
}
```

---

### 9️⃣ CREATE Customer

**Method:** `POST`  
**URL:** `{{acme_url}}/customers`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "555-1234-5678",
  "address": "123 Main Street, Anytown, USA"
}
```

**Expected Response:** ✅ 201 Created
```json
{
  "id": "customer-uuid",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "555-1234-5678",
  "address": "123 Main Street, Anytown, USA",
  "created_at": "2025-12-08T..."
}
```

**Save the customer `id`** - needed for orders

---

### 🔟 GET Single Customer

**Method:** `GET`  
**URL:** `{{acme_url}}/customers/{customer_id}`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK

---

### 1️⃣1️⃣ UPDATE Customer

**Method:** `PUT`  
**URL:** `{{acme_url}}/customers/{customer_id}`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "John Doe Updated",
  "phone": "555-9999-9999",
  "address": "456 Oak Avenue, Somewhere, USA"
}
```

**Expected Response:** ✅ 200 OK

---

### 1️⃣2️⃣ DELETE Customer

**Method:** `DELETE`  
**URL:** `{{acme_url}}/customers/{customer_id}`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK

---

## ORDERS ENDPOINTS

### 1️⃣3️⃣ GET All Orders

**Method:** `GET`  
**URL:** `{{acme_url}}/orders`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK
```json
{
  "data": [],
  "meta": { "current_page": 1, "per_page": 20, "total": 0 }
}
```

---

### 1️⃣4️⃣ CREATE Order

**Method:** `POST`  
**URL:** `{{acme_url}}/orders`

⚠️ **Requirements:**
- Need at least 1 product (create in step 4)
- Need at least 1 customer (create in step 9)

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "customer_id": "customer-uuid-from-step-9",
  "status": "pending",
  "total_amount": 1299.99,
  "items": [
    {
      "product_id": "product-uuid-from-step-4",
      "quantity": 1,
      "price": 1299.99
    }
  ]
}
```

**Expected Response:** ✅ 201 Created
```json
{
  "id": "order-uuid",
  "customer_id": "customer-uuid",
  "status": "pending",
  "total_amount": 1299.99,
  "items": [
    {
      "product_id": "product-uuid",
      "quantity": 1,
      "price": 1299.99
    }
  ],
  "created_at": "2025-12-08T..."
}
```

---

### 1️⃣5️⃣ GET Single Order

**Method:** `GET`  
**URL:** `{{acme_url}}/orders/{order_id}`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK

---

## STOCKS ENDPOINTS

### 1️⃣6️⃣ GET All Stocks

**Method:** `GET`  
**URL:** `{{acme_url}}/stocks`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK
```json
{
  "data": [],
  "meta": { "current_page": 1, "per_page": 20, "total": 0 }
}
```

---

### 1️⃣7️⃣ CREATE Stock

**Method:** `POST`  
**URL:** `{{acme_url}}/stocks`

⚠️ **Requirements:**
- Need product from step 4

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "product_id": "product-uuid-from-step-4",
  "quantity": 50,
  "warehouse": "Main Warehouse",
  "location": "Shelf A5"
}
```

**Expected Response:** ✅ 201 Created
```json
{
  "id": "stock-uuid",
  "product_id": "product-uuid",
  "quantity": 50,
  "warehouse": "Main Warehouse",
  "location": "Shelf A5",
  "created_at": "2025-12-08T..."
}
```

---

### 1️⃣8️⃣ GET Single Stock

**Method:** `GET`  
**URL:** `{{acme_url}}/stocks/{stock_id}`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK

---

### 1️⃣9️⃣ UPDATE Stock

**Method:** `PUT`  
**URL:** `{{acme_url}}/stocks/{stock_id}`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "quantity": 45,
  "warehouse": "Main Warehouse",
  "location": "Shelf A5"
}
```

**Expected Response:** ✅ 200 OK

---

## AUTHENTICATION & SECURITY TESTS

### 2️⃣0️⃣ Test: No Token (Should Fail)

**Method:** `GET`  
**URL:** `{{acme_url}}/products`

**Headers:**
```
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ❌ 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

✅ **This is correct behavior** - endpoint is protected

---

### 2️⃣1️⃣ Test: Invalid Token (Should Fail)

**Method:** `GET`  
**URL:** `{{acme_url}}/products`

**Headers:**
```
Authorization: Bearer invalid-token-xyz
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ❌ 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

✅ **This is correct behavior** - token validation working

---

### 2️⃣2️⃣ Test: ACME Token on GLOBEX Domain (Should Fail)

First, get GLOBEX token (repeat steps 1 with globex_url and globex_token)

**Method:** `GET`  
**URL:** `{{globex_url}}/products`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ❌ 401 Unauthorized

✅ **This is correct behavior** - tokens are tenant-isolated

---

## LOGOUT

### 2️⃣3️⃣ Logout from ACME

**Method:** `POST`  
**URL:** `{{acme_url}}/logout`

**Headers:**
```
Authorization: Bearer {{acme_token}}
Content-Type: application/json
```

**Body:** (empty)

**Expected Response:** ✅ 200 OK
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**After logout:**
- Token is deleted from database
- Next request with this token will return 401
- Must login again to get new token

---

## QUICK TEST SEQUENCE

Follow this order to test everything:

1. ✅ Login ACME (step 1)
2. ✅ Get /me (step 2)
3. ✅ Create Product (step 4)
4. ✅ Get all Products (step 3)
5. ✅ Get single Product (step 5)
6. ✅ Update Product (step 6)
7. ✅ Create Customer (step 9)
8. ✅ Get all Customers (step 8)
9. ✅ Create Order (step 14) - needs product + customer
10. ✅ Get all Orders (step 13)
11. ✅ Create Stock (step 17) - needs product
12. ✅ Get all Stocks (step 16)
13. ✅ Test: No Token (step 20) - should fail ✅
14. ✅ Test: Invalid Token (step 21) - should fail ✅
15. ✅ Logout ACME (step 23)

---

## GLOBEX TENANT TEST

Repeat the same flow but with:
- Use `{{globex_url}}` instead of `{{acme_url}}`
- Use `{{globex_token}}` instead of `{{acme_token}}`
- Login with GLOBEX credentials
- Create different products/customers

---

## Expected Results Summary

| Endpoint | Method | Expected |
|----------|--------|----------|
| `/login` | POST | 200 ✅ |
| `/me` | GET | 200 ✅ |
| `/products` | GET | 200 ✅ |
| `/products` | POST | 201 ✅ |
| `/products/{id}` | GET | 200 ✅ |
| `/products/{id}` | PUT | 200 ✅ |
| `/products/{id}` | DELETE | 200 ✅ |
| `/customers` | GET | 200 ✅ |
| `/customers` | POST | 201 ✅ |
| `/customers/{id}` | GET | 200 ✅ |
| `/customers/{id}` | PUT | 200 ✅ |
| `/customers/{id}` | DELETE | 200 ✅ |
| `/orders` | GET | 200 ✅ |
| `/orders` | POST | 201 ✅ |
| `/orders/{id}` | GET | 200 ✅ |
| `/stocks` | GET | 200 ✅ |
| `/stocks` | POST | 201 ✅ |
| `/stocks/{id}` | GET | 200 ✅ |
| `/stocks/{id}` | PUT | 200 ✅ |
| `/logout` | POST | 200 ✅ |
| `No Token` | - | 401 ❌ |
| `Invalid Token` | - | 401 ❌ |
| `Wrong Tenant Token` | - | 401 ❌ |

---

## Notes

- Replace `{product_id}`, `{customer_id}`, `{order_id}`, `{stock_id}` with actual IDs from responses
- All endpoints return **pagination** for list requests
- All successful requests return `Content-Type: application/json`
- All timestamps are in ISO 8601 format (e.g., `2025-12-08T10:30:45Z`)
- Tenant data is completely isolated (ACME can't see GLOBEX data)

---

**That's it! Copy these requests into Postman and test them one by one.** 🎉
