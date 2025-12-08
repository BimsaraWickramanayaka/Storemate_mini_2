# Auth Token Flow Architecture

> Understanding how tokens flow from login through to API requests

---

## Complete Request Flow

```
┌──────────────────┐
│  User Logs In    │
│ admin@tenant.com │
│  password123     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ AuthContext.login() called           │
│ POST /api/v1/login                   │
│ Body: { email, password }            │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Backend AuthController               │
│ - Validates credentials              │
│ - Creates Sanctum token              │
│ - Returns token in response          │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Response: {                              │
│   token: "1|7frK3oylKQODkrwSMhcQKReB...",│
│   user: { id, name, email, role }      │
│ }                                       │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ AuthContext saves to state & storage │
│ - setToken(token)                    │
│ - localStorage.authToken = token     │
│ - localStorage.authUser = user       │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ axiosClient interceptor detects token│
│ - Sets Authorization header          │
│ - All future requests include token  │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ User navigates to Products page                 │
│ productApi.js calls: client.get("/products")   │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ axiosClient Request Interceptor triggers        │
│ 1. Reads token from localStorage                │
│ 2. Adds to request headers:                     │
│    Authorization: Bearer 1|7frK3oylKQODkrwSMhcQKReB...
│ 3. Sends request                               │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Request reaches Laravel backend:       │
│ GET /api/v1/products                   │
│ Authorization: Bearer {token}          │
│                                        │
│ Middleware chain:                      │
│ 1. InitializeTenancyByDomain           │
│    → Detects tenant from domain        │
│ 2. auth:sanctum                        │
│    → Validates token                   │
│    → Checks token owner is valid user │
│ 3. ProductController@index             │
│    → Returns tenant-scoped products    │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Response: [products...]            │
│ Status: 200 OK                     │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ axiosClient Response Interceptor       │
│ 1. Check status code                   │
│ 2. If 401 → token invalid/expired      │
│    - Clear localStorage                │
│    - Clear state                       │
│    - Redirect to /login                │
│ 3. If 200 → success                    │
│    - Return data to component          │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ ProductList component receives data│
│ Renders products in table          │
└────────────────────────────────────┘
```

---

## File Breakdown & Their Roles

### Frontend

#### 1. `AuthContext.jsx`
**Purpose:** Central auth state management

**Key Methods:**
```javascript
login(email, password)
  → Calls: POST /api/v1/login
  → Saves: token, user to state & localStorage
  → Returns: { success, user }

logout()
  → Calls: POST /api/v1/logout (revokes on backend)
  → Clears: token, user from state & localStorage

restoreSession() (useEffect on mount)
  → Reads: token, user from localStorage
  → Validates: Calls GET /api/v1/me to verify token
  → If 401: Clears everything
  → If 200: Sets authenticated state
```

**What It Stores:**
```javascript
{
  user: { id, name, email, role },
  token: "1|7frK3oylKQODkrwSMhcQKReB...",
  isAuthenticated: true/false,
  isLoading: true/false,
  error: "error message"
}
```

---

#### 2. `axiosClient.js`
**Purpose:** HTTP client with automatic token injection

**Request Interceptor:**
```javascript
// BEFORE sending request
// Reads token from localStorage
// Adds to headers: Authorization: Bearer {token}
// Sends request
```

**Response Interceptor:**
```javascript
// AFTER receiving response
if (status === 401) {
  // Token invalid/expired
  localStorage.removeItem('authToken')
  window.location.href = '/login'
}
return response
```

**Base URL:**
- Default: `http://acme.localhost:8000/v1`
- Changes when: TenantContext switches tenant
- Called: `setTenantBaseURL(domain)` from TenantContext

---

#### 3. `Login.jsx`
**Purpose:** Login form with tenant selector

**Flow:**
1. User selects tenant
2. Calls: `TenantContext.switchTenant()`
   → Updates axiosClient baseURL to tenant domain
3. User enters email/password
4. Calls: `AuthContext.login(email, password)`
   → POST to: `{tenant_domain}/api/v1/login`
   → Saves token
5. Redirects: Navigate to `/`

---

#### 4. `ProductList.jsx` (and other page components)
**Purpose:** Display data from API

**Flow:**
1. On mount: `useEffect(() => fetchProducts())`
2. Calls: `productApi.fetchProducts()`
   → Which calls: `client.get("/products")`
3. axiosClient interceptor adds token ✅
4. Request sent with: `Authorization: Bearer {token}`
5. Receives products, renders table

---

#### 5. `productApi.js` (and other API modules)
**Purpose:** Centralized API calls

**Example:**
```javascript
export const getProducts = (params) => 
  client.get("/products", { params })

// Uses axiosClient which has:
// - Correct baseURL (from TenantContext)
// - Token interceptor
```

---

### Backend

#### 1. `routes/api.php`
**Purpose:** Public routes (no authentication)

```php
Route::middleware([EnableCorsMiddleware::class, 'api'])
  ->prefix('v1')
  ->group(function () {
    Route::get('tenants', [TenantController::class, 'index']);
  });
```

**Used by:** Login page to fetch available tenants

---

#### 2. `routes/tenant.php`
**Purpose:** Tenant-specific routes (with authentication)

```php
// Public (no auth)
Route::post('api/v1/login', [AuthController::class, 'login']);

// Protected (auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
  Route::get('api/v1/me', [AuthController::class, 'me']);
  Route::get('api/v1/products', [ProductController::class, 'index']);
  // ... all other CRUD routes
});
```

**Middleware Order:**
1. `InitializeTenancyByDomain` - switches to tenant database
2. `auth:sanctum` - validates token
3. `PreventAccessFromCentralDomains` - only tenant domains allowed
4. `EnableCorsMiddleware` - allows cross-origin requests

---

#### 3. `AuthController.php`
**Purpose:** Login, logout, user info

```php
login() 
  → Validates credentials
  → Creates token: $user->createToken('auth_token')
  → Returns token + user

me()
  → Returns Auth::user() (current authenticated user)

logout()
  → Revokes token: Auth::user()->currentAccessToken()->delete()
```

---

#### 4. `ProductController.php` (and other controllers)
**Purpose:** CRUD operations for models

```php
index()
  → Product::with('stocks')->paginate(20)
  → Auto-filtered to current tenant (via Stancl)

store(StoreProductRequest $request)
  → Creates product in current tenant
  → Returns 201 Created

show(Product $product)
  → Returns single product for current tenant
  → Returns 404 if product doesn't belong to tenant

update(UpdateProductRequest $request, Product $product)
  → Updates product in current tenant

destroy(Product $product)
  → Deletes product from current tenant
```

---

#### 5. `TenancyServiceProvider.php`
**Purpose:** Configures multi-tenancy middleware

```php
public function mapRoutes()
  → Wraps tenant routes with:
    - EnableCorsMiddleware
    - api middleware
    - InitializeTenancyByDomain
    - PreventAccessFromCentralDomains
```

**What it does:**
- When request comes to `acme.localhost:8000/api/v1/products`
- InitializeTenancyByDomain detects "acme" from domain
- Sets Stancl to use `tenantacme` database
- All model queries scoped to current tenant
- Token validated against users in `tenantacme` database

---

## Data Flow Examples

### Example 1: Login and Get Products

```
1. Frontend: User logs in
   POST acme.localhost:8000/api/v1/login
   Body: { email: "admin@tenant.com", password: "password123" }

2. Backend: AuthController@login
   - Query users table in tenantacme database
   - Validate password
   - Create token using Sanctum
   - Return token

3. Frontend: Save token
   localStorage.authToken = "1|7frK3oylKQODkrwSMhcQKReB..."
   axiosClient base URL = "http://acme.localhost:8000/v1"

4. Frontend: Navigate to Products
   productApi.getProducts()
   → client.get("/products")
   → Interceptor adds: Authorization: Bearer 1|7frK3oylKQODkrwSMhcQKReB...
   → Sends: GET acme.localhost:8000/api/v1/products

5. Backend: ProductController@index
   - Middleware InitializeTenancyByDomain sets tenant = acme
   - Middleware auth:sanctum validates token
   - Returns: Product::with('stocks')->paginate()
   - Only returns products from tenantacme database

6. Frontend: Display products
   ProductList renders table with data
```

### Example 2: Switch Tenants

```
1. User clicks Logout
   AuthContext.logout()
   - POST /api/v1/logout (revokes token)
   - Clears token from localStorage
   - Clears token from axiosClient headers
   - Redirects to /login

2. User selects GLOBEX
   TenantContext.switchTenant({ id: "globex", domain: "globex.localhost" })
   - setTenantBaseURL("globex.localhost")
   - axiosClient.baseURL = "http://globex.localhost:8000/v1"

3. User logs in again
   AuthContext.login("admin@tenant.com", "password123")
   - POST globex.localhost:8000/api/v1/login
   - Middleware InitializeTenancyByDomain sets tenant = globex
   - Token validated against users in tenantglobex database
   - New token issued for GLOBEX user

4. Frontend: Products page
   productApi.getProducts()
   - GET globex.localhost:8000/api/v1/products
   - Returns GLOBEX products only (different from ACME)
```

### Example 3: Token Expires/Becomes Invalid

```
1. User has valid token
   localStorage.authToken = "1|7frK3oylKQODkrwSMhcQKReB..."

2. Token deleted on backend (or 24hr expiration)

3. Frontend tries to fetch data
   productApi.getProducts()
   - Sends request with token
   - Backend auth:sanctum middleware rejects (404 in personal_access_tokens)
   - Returns: 401 Unauthorized

4. axiosClient Response Interceptor catches 401
   if (status === 401) {
     localStorage.removeItem('authToken')
     localStorage.removeItem('authUser')
     window.location.href = '/login'
   }

5. User redirected to login
   Must log in again to get new token
```

---

## Security Points

1. **Token Storage:**
   - Token stored in localStorage (accessible to JavaScript)
   - Only sent in Authorization header (HTTPS in production)
   - Not in cookies (CSRF resistant)

2. **Token Validation:**
   - Backend hashes token using bcrypt
   - Plaintext token sent to frontend, hashed version in DB
   - Frontend can't fake tokens (doesn't have hash)

3. **Tenant Isolation:**
   - Domain-based tenant detection (acme.localhost vs globex.localhost)
   - User tokens only valid for their tenant
   - Database queries scoped to tenant

4. **Multi-tenancy:**
   - InitializeTenancyByDomain middleware switches database context
   - All Eloquent models scoped to current tenant
   - User from ACME can't see GLOBEX data

---

## Debugging Tips

### "401 Unauthorized" Error
- Check: Is token in localStorage?
- Check: Is Authorization header being sent? (DevTools → Network tab)
- Check: Did token expire? (login again)
- Check: Are you on correct tenant domain?

### "404 Not Found" Error
- Check: Is endpoint correct? (`/api/v1/products`)
- Check: Is baseURL correct? (should match tenant domain)
- Check: Is backend running?

### "Products show from ACME when logged into GLOBEX"
- Check: Did you switch tenant before login?
- Check: Is InitializeTenancyByDomain working?
- Check: Are you on globex.localhost domain?

### "Token persists after logout"
- Check: Is logout clearing localStorage?
- Check: Is AuthContext.logout() being called?
- Check: Is token being sent on new requests?

---

**This architecture ensures:**
✅ Secure token-based authentication  
✅ Automatic token injection on all requests  
✅ Proper multi-tenant data isolation  
✅ Session persistence across refreshes  
✅ Automatic logout on token expiration
