# Quick Testing Checklist - After Login Works

Follow this checklist to verify all endpoints are working after you've successfully logged in.

---

## ✅ Step 1: Verify Backend is Running & Responsive

Open terminal and run:
```bash
cd backend
php artisan serve
```

You should see: `Server running at http://127.0.0.1:8000`

Test with curl (in a separate terminal):
```bash
curl http://localhost:8000/api/v1/tenants
```

Should return JSON with tenant list.

---

## ✅ Step 2: Login via Frontend

1. Visit http://localhost:5173
2. Select **ACME** from dropdown
3. Enter: `admin@tenant.com` / `password123`
4. Click **Login**
5. Should redirect to Dashboard

✅ **Expected Result:** Dashboard loads, Navbar shows user email & Logout button

---

## ✅ Step 3: Test Each Page (After Login)

### Test Products Page
```
Click: Products (in navbar)
Expected: Products list loads (may be empty)
Expected: "Add Product" button visible
```

If this works ✅ → OrderController, CustomerController, StockController should also work

### Test Orders Page
```
Click: Orders (in navbar)
Expected: Orders list loads
```

### Test Customers Page
```
Click: Customers (in navbar)
Expected: Customers list loads
```

### Test Stocks Page
```
Click: Stocks (in navbar)
Expected: Stocks list loads
```

---

## ✅ Step 4: Check Browser Console for Errors

Open DevTools (F12) → Console tab

**Look for:**
- ❌ `401 Unauthorized` → Token not being sent (check axiosClient interceptor)
- ❌ `404 Not Found` → Wrong endpoint path (check API functions)
- ❌ `Network Error` → Backend not running (restart backend)
- ✅ No errors → Everything working!

---

## ✅ Step 5: Test API Directly with Postman/cURL

### Get Token from Frontend
1. Open DevTools → Storage → Local Storage
2. Copy `authToken` value
3. Use in requests below

### Test GET /products
```bash
curl -X GET http://acme.localhost:8000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Expected:** 200 OK with JSON array of products (may be empty `[]`)

If you get `401 Unauthorized` → **Problem with auth**
If you get `200 OK` → ✅ **Authentication working!**

### Test GET /orders
```bash
curl -X GET http://acme.localhost:8000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Expected:** 200 OK

### Test GET /customers
```bash
curl -X GET http://acme.localhost:8000/api/v1/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Expected:** 200 OK

### Test GET /stocks
```bash
curl -X GET http://acme.localhost:8000/api/v1/stocks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Expected:** 200 OK

---

## ✅ Step 6: Test Frontend Interactions

### Create a Product (if Products page loads)
1. Go to Products
2. Click "Add Product"
3. Fill form:
   - Name: "Test Product"
   - Price: "99.99"
   - SKU: "TEST-001"
4. Click Submit

**Expected:** 
- ✅ Form submits
- ✅ Product appears in list
- ✅ Redirect back to Products page

If this works ✅ → POST endpoints working

### Delete a Product (if Create worked)
1. Click Delete on the product you just created
2. Confirm deletion

**Expected:**
- ✅ Product removed from list

If this works ✅ → DELETE endpoints working

---

## ✅ Step 7: Test Multi-Tenant Isolation

### Logout from ACME
1. Click Logout button
2. Back to Login page ✅

### Login to GLOBEX
1. Select **GLOBEX** from dropdown
2. Enter: `admin@tenant.com` / `password123`
3. Click Login

**Expected:**
- ✅ Different products list (isolated from ACME)
- ✅ GLOBEX data only

### Verify Data is Isolated
1. Go to Products page
2. Note the products in GLOBEX
3. Should be **completely different** from ACME

If GLOBEX shows same products as ACME → **Tenant isolation broken** ❌

---

## ✅ Step 8: Check Token Persistence

### After successful login
1. Refresh page (F5)
2. Dashboard should still load (no redirect to login)

**Expected:**
- ✅ Session persists
- ✅ No "Failed to fetch" errors
- ✅ User info still shows in navbar

If redirects to login → Token not being restored from localStorage ❌

---

## Troubleshooting

### If All Pages Show "Failed to fetch"

**Check 1:** Is backend running?
```bash
php artisan serve
```

**Check 2:** Is token being sent?
- Open DevTools → Network tab
- Click on API request (e.g., `products`)
- Check Headers tab → Look for `Authorization: Bearer...`
- If missing → axiosClient interceptor not working

**Check 3:** Is token valid?
```bash
# Test with the token from localStorage
curl -X GET http://acme.localhost:8000/api/v1/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

If 401 → Token invalid or expired, login again

### If Only One Page Fails

**Check:** Did you create data for that resource?
- Products page fails because no products exist? → Create one
- Orders page fails because no orders exist? → Create one

Try creating a test record via API:
```bash
curl -X POST http://acme.localhost:8000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "price": 99.99,
    "sku": "TEST-001",
    "description": "Test product"
  }'
```

---

## Final Verification

If you can check all these ✅:

- [ ] Login works
- [ ] Products page loads
- [ ] Orders page loads
- [ ] Customers page loads
- [ ] Stocks page loads
- [ ] Can create/edit/delete (if forms are implemented)
- [ ] Logout works
- [ ] Session persists on refresh
- [ ] ACME and GLOBEX data are isolated
- [ ] No console errors

**Then all backend endpoints are working correctly!** 🎉

---

If any fail, note which one and share the console error message.
