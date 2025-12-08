# Storemate OMS - Development Summary & Guide

## Project Overview

**Storemate** is a multi-tenant Order Management System (OMS) built with Laravel 11 backend and React 18 frontend. It handles complete order lifecycle management with inventory tracking and FIFO stock deduction.

**Technology Stack:**
- **Backend:** Laravel 11, PostgreSQL 15, Stancl Tenancy (domain-based)
- **Frontend:** React 18, Vite, Tailwind CSS, Axios
- **Multi-tenancy:** Domain-based routing (acme.localhost:8000, globex.localhost:8000)

---

## Part 1: Backend Architecture

### Database Schema

**Core Tables (in `inventory` schema per tenant):**

1. **Products** (`inventory.products`)
   - `id` (UUID, PK)
   - `sku` (string, unique)
   - `name` (string)
   - `description` (text)
   - `price` (decimal)
   - Relationships: `hasMany('stocks')`, `hasMany('orderItems')`

2. **Customers** (`inventory.customers`)
   - `id` (UUID, PK)
   - `name` (string, required)
   - `email` (string, nullable, unique lookup)
   - `phone` (string, nullable)
   - Relationships: `hasMany('orders')`

3. **Stock** (`inventory.stocks`)
   - `id` (UUID, PK)
   - `product_id` (UUID, FK to products)
   - `quantity` (integer, min:1)
   - `batch_code` (string, nullable, max:255)
   - `received_at` (timestamp, nullable)
   - Relationships: `belongsTo('products')`

4. **Orders** (`inventory.orders`)
   - `id` (UUID, PK)
   - `customer_id` (UUID, FK to customers)
   - `order_number` (string, unique)
   - `status` (enum: pending, confirmed, shipped, cancelled)
   - `total_amount` (decimal)
   - `ordered_at` (timestamp)
   - Relationships: `belongsTo('customers')`, `hasMany('orderItems')`

5. **OrderItems** (`inventory.order_items`)
   - `id` (UUID, PK)
   - `order_id` (UUID, FK to orders)
   - `product_id` (UUID, FK to products)
   - `quantity` (integer)
   - `price_at_purchase` (decimal)
   - Relationships: `belongsTo('orders')`, `belongsTo('products')`

### API Routes

**Base Path:** `/v1` (all routes are tenant-aware via Stancl Tenancy)

#### Products
```
GET    /products                    - List (paginated, 20 per page)
POST   /products                    - Create
GET    /products/{product}          - Show with stocks
PUT    /products/{product}          - Update (blocked if has order items)
DELETE /products/{product}          - Delete (blocked if has order items)
```

#### Customers
```
GET    /customers                   - List (paginated, 20 per page)
POST   /customers                   - Create
GET    /customers/{customer}        - Show with orders
PUT    /customers/{customer}        - Update
DELETE /customers/{customer}        - Delete (blocked if has orders)
```

#### Stock
```
GET    /stocks                      - List (paginated, 20 per page)
POST   /stocks                      - Create batch
GET    /stocks/{stock}              - Show single batch with product
DELETE /stocks/{stock}              - Delete batch
GET    /products/{product}/stocks   - Get stocks for specific product
```

#### Orders
```
GET    /orders                      - List (paginated, 20 per page)
POST   /orders                      - Create (with inline customer support)
GET    /orders/{order}              - Show with customer and items
POST   /orders/{order}/confirm      - Confirm order (deduct stock FIFO)
POST   /orders/{order}/cancel       - Cancel order
DELETE /orders/{order}              - Delete (pending only)
```

### Key Services

**OrderService** (`app/Services/OrderService.php`)
- `createOrder()`: Creates pending order without stock deduction
- `confirmOrder()`: Confirms order and deducts stock using FIFO algorithm
- `cancelOrder()`: Cancels order and restores stock
- Uses database transactions for data consistency

**Stock Deduction Logic (FIFO):**
1. When order is confirmed, for each order item:
2. Get all stock batches ordered by `received_at` (oldest first)
3. Deduct quantity from batches in order until satisfied
4. Lock rows with `lockForUpdate()` for concurrency safety

### Request Validation

**StoreProductRequest:**
- `name`: required, string, max:255
- `sku`: required, string, unique
- `price`: required, numeric, min:0
- `description`: nullable, string

**UpdateProductRequest:**
- `name`: sometimes, required, string, max:255
- `sku`: sometimes, required, string, unique (ignoring current product)
- `price`: sometimes, required, numeric, min:0
- `description`: nullable, string
- **Constraint:** Cannot update if product has order items (409 Conflict)

**StoreCustomerRequest:**
- `name`: required, string, max:255
- `email`: nullable, email
- `phone`: nullable, string, max:20

**UpdateCustomerRequest:**
- `name`: sometimes, required, string, max:255
- `email`: sometimes, nullable, email
- `phone`: sometimes, nullable, string, max:20

**StoreStockRequest:**
- `product_id`: required, uuid
- `quantity`: required, integer, min:1
- `batch_code`: nullable, string, max:255

**StoreOrderRequest:**
- `customer.name`: required_without:email, string, max:255
- `customer.email`: nullable, email
- `customer.phone`: nullable, string, max:20
- `items`: required, array, min:1
- `items.*.product_id`: required, uuid
- `items.*.quantity`: required, integer, min:1

### Middleware & Utilities

**EnableCorsMiddleware** (`app/Http/Middleware/EnableCorsMiddleware.php`)
- Handles CORS headers for cross-origin requests
- Allows credentials
- Supports preflight OPTIONS requests

**Global OPTIONS Handler** (routes/web.php)
- Responds to OPTIONS requests for CORS preflight
- No further authentication needed

### Multi-Tenancy Setup

**Tenancy Configuration** (config/tenancy.php)
- Central connection: `central` (PostgreSQL)
- Tenant connection template: `pgsql`
- Schema per tenant: `inventory`
- Bootstrappers: Database, Cache, Filesystem, Queue

**Tenant Models:**
- All models use `protected $table = 'inventory.{table_name}'`
- All models use `HasUuids` trait
- Database queries automatically scoped to current tenant

---

## Part 2: Frontend Architecture

### Project Structure

```
frontend/
├── src/
│   ├── api/                    # API integration layer
│   │   ├── axiosClient.js      # Axios instance with Proxy pattern
│   │   ├── productApi.js       # Product endpoints
│   │   ├── customerApi.js      # Customer endpoints
│   │   ├── orderApi.js         # Order endpoints
│   │   ├── stockApi.js         # Stock endpoints
│   │   └── _helpers.js         # Response parsing utilities
│   ├── components/             # Reusable components
│   │   ├── Navbar.jsx          # Navigation with tenant switcher
│   │   ├── Loading.jsx         # Loading spinner
│   │   └── ErrorBox.jsx        # Error display
│   ├── context/                # State management
│   │   └── TenantContext.jsx   # Tenant selection & switching
│   ├── pages/                  # Page components
│   │   ├── Dashboard.jsx
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductCreate.jsx
│   │   │   └── ProductEdit.jsx
│   │   ├── customers/
│   │   │   ├── CustomerList.jsx
│   │   │   ├── CustomerCreate.jsx
│   │   │   └── CustomerEdit.jsx
│   │   ├── orders/
│   │   │   ├── OrderList.jsx
│   │   │   ├── OrderCreate.jsx
│   │   │   └── OrderDetail.jsx
│   │   └── stocks/
│   │       ├── StockList.jsx
│   │       └── StockCreate.jsx
│   ├── App.jsx                 # Main app with routes
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Multi-Tenancy (Frontend)

**TenantContext.jsx** provides:
- `tenant`: Current tenant object with `{ id, name, domain }`
- `tenants`: Array of available tenants
- `switchTenant(tenant)`: Changes current tenant
- `tenantChangeCount`: Trigger to reload data on tenant change
- LocalStorage persistence

**Axios Client Pattern (Proxy):**
```javascript
// axiosClient.js
const clientWrapper = { instance: axios.create(...) };

export const setTenantBaseURL = (domain) => {
  clientWrapper.instance = axios.create({
    baseURL: `http://${domain}/v1`,
    ...
  });
};

export default new Proxy(clientWrapper, {
  get(target, prop) {
    return target.instance[prop];
  }
});
```

**Why this pattern?**
- When tenant changes, axios client is recreated with new domain
- Dynamic URL switching without breaking references
- All API modules receive updated client automatically

**Data Refresh on Tenant Change:**
All pages listen to `tenantChangeCount` in useEffect dependencies:
```javascript
useEffect(() => {
  // Load data for current tenant
}, [tenant.id, tenantChangeCount]);
```

### API Integration Layer

**Helper Functions:**
```javascript
// _helpers.js
export const extractList = (response) => {
  // Handles both paginated and non-paginated responses
  // Returns { items, meta }
};
```

**Product API:**
```javascript
export const getProducts = (params) => client.get("/products", { params });
export const fetchProduct(id) => client.get(`/products/${id}`).data;
export const createProduct = (payload) => client.post("/products", payload);
export const updateProduct = (id, payload) => client.put(`/products/${id}`, payload);
export const deleteProduct = (id) => client.delete(`/products/${id}`);
export const fetchProducts = (params) => extractList(getProducts(params));
```

Similar patterns for customerApi, orderApi, stockApi.

### Component Patterns

**List Component Pattern:**
1. Fetch data on mount and when tenant changes
2. Show loading state
3. Display error box if error occurs
4. Render table with actions
5. Pagination support

**Create Component Pattern:**
1. Fetch related data (customers, products)
2. Form with validation
3. Submit button with loading state
4. Cancel button to go back
5. Auto-redirect on success

**Edit Component Pattern:**
1. Load single resource with `fetchResource(id)`
2. Pre-populate form
3. Show resource name/identifier in header
4. Submit button with loading state
5. Error handling for constraints (409 Conflicts)

**Error Handling:**
```javascript
catch (err) {
  if (err.response?.status === 409) {
    // Handle constraint violations
    setError({ message: "User-friendly message" });
  } else {
    setError(err);
  }
}
```

### Routes

```javascript
/                          - Dashboard
/products                  - Product List
/products/create           - Create Product
/products/:id/edit         - Edit Product

/customers                 - Customer List
/customers/create          - Create Customer
/customers/:id/edit        - Edit Customer

/orders                    - Order List
/orders/create             - Create Order
/orders/:id                - Order Details

/stocks                    - Stock List
/stocks/create             - Create Stock Batch
```

### Features Implemented

✅ **Products Module:**
- Full CRUD with edit/delete constraints
- SKU immutability after creation
- Stock totaling from batches

✅ **Customers Module:**
- Full CRUD
- Email uniqueness for order matching
- Order count display
- Delete constraints if has orders

✅ **Stock Module:**
- Create batches with FIFO tracking
- Batch codes for reference
- Received date for FIFO ordering
- Delete functionality

✅ **Orders Module:**
- Create with existing or new customer
- Inline customer creation
- Multiple items per order
- Order detail page with full information
- Order lifecycle: pending → confirmed → shipped/cancelled
- Delete constraints (pending only)
- Stock deduction on confirm

✅ **Cross-cutting:**
- Multi-tenant switching
- CORS support
- Error handling with 409 Conflicts
- Loading states
- Pagination support
- Responsive UI with Tailwind CSS

---

## Part 3: Integration Points

### CORS Handling
**Problem:** Frontend requests blocked by CORS policy
**Solution:** 
- Created `EnableCorsMiddleware` in backend
- Added global OPTIONS handler in `web.php`
- Frontend can now make POST/PUT/DELETE requests

### Tenant Switching
**Problem:** Switching tenant showed old tenant's data
**Solution:**
- Implemented Proxy pattern in axios client
- Added `tenantChangeCount` trigger in TenantContext
- All pages listen to `tenantChangeCount` to reload

### Product Edit with Constraints
**Problem:** 500 errors when editing products
**Solution:**
- Fixed UpdateProductRequest to use `Rule::unique()` instead of hardcoded string
- Removed SKU from update payload (immutable)
- Made SKU field read-only in form

### Customer Order Association
**Problem:** Selected customer not assigned to order
**Solution:**
- Updated OrderCreate to send full customer object (name, email, phone)
- Backend's `firstOrCreate()` matches by email
- Creates new customer if email doesn't exist

---

## Part 4: Future Development Guide

### Phase 1: Authentication & Authorization
**Files to create:**
- `app/Http/Middleware/Authenticate.php` - JWT validation
- `app/Http/Controllers/API/AuthController.php` - Login/Register
- `frontend/src/pages/Login.jsx` - Login page
- `frontend/src/context/AuthContext.jsx` - Auth state

**Tasks:**
1. Add User model with roles (admin, manager, staff)
2. Implement JWT token authentication
3. Add role-based access control (RBAC)
4. Protect API routes with auth middleware
5. Add login/logout to frontend

### Phase 2: Dashboard & Analytics
**Files to create:**
- `frontend/src/pages/Dashboard.jsx` - Analytics dashboard
- `app/Http/Controllers/API/DashboardController.php` - Stats endpoint

**Tasks:**
1. Add Chart.js or Recharts to frontend
2. Create statistics endpoints (total orders, revenue, etc.)
3. Display KPIs on dashboard
4. Add date range filtering

### Phase 3: Search & Filtering
**Files to modify:**
- All list pages (ProductList, OrderList, etc.)
- API endpoints to support filtering

**Tasks:**
1. Add search input to list pages
2. Add filter buttons (by status, date, customer, etc.)
3. Implement query parameter handling
4. Add API filtering logic

### Phase 4: Export & Reporting
**New packages:** `laravel-excel`, `pdf-lib`

**Files to create:**
- `app/Exports/OrderExport.php` - Excel export
- Export routes

**Tasks:**
1. Add export buttons to list pages
2. Implement CSV/Excel export
3. Add PDF generation for order invoices
4. Schedule report generation

### Phase 5: Notifications
**New packages:** `laravel-notifications`, `pusher`

**Tasks:**
1. Send email on order confirmation
2. Send SMS for order status changes
3. Add in-app notifications
4. Implement real-time updates with WebSockets

### Phase 6: Testing
**Testing framework:** PHPUnit (backend), Jest/Vitest (frontend)

**Files to create:**
- `tests/Feature/OrderTest.php`
- `tests/Unit/OrderServiceTest.php`
- `frontend/src/__tests__/OrderCreate.test.jsx`

**Tasks:**
1. Write unit tests for services
2. Write integration tests for API endpoints
3. Write component tests for React pages
4. Aim for 80%+ coverage

### Phase 7: Docker Deployment
**Files to create:**
- `Dockerfile`
- `.dockerignore`
- `docker-compose.prod.yml`

**Tasks:**
1. Containerize backend
2. Containerize frontend (Nginx)
3. Set up PostgreSQL container
4. Create production docker-compose

### Phase 8: Advanced Features
- Inventory forecasting
- Order templates/recurring orders
- Customer groups & pricing tiers
- Returns & refunds management
- Multi-currency support
- Barcode scanning
- Mobile app

---

## Development Workflow

### Backend Development

**Adding a new endpoint:**

1. Create migration (if needed):
```bash
php artisan make:migration create_table_name
```

2. Create/update model:
```bash
php artisan make:model ModelName
```

3. Create request validation:
```bash
php artisan make:request StoreModelNameRequest
```

4. Create controller method:
```bash
php artisan make:controller API/ModelNameController
```

5. Add route to `routes/tenant.php`

6. Test with Postman/Curl:
```bash
curl -H "Host: acme.localhost" http://localhost:8000/v1/endpoint
```

### Frontend Development

**Adding a new page:**

1. Create component in `src/pages/module/`
2. Add useEffect for data loading with tenant dependency
3. Handle loading and error states
4. Create API methods in `src/api/`
5. Add route to `App.jsx`
6. Add navigation link to `Navbar.jsx`

**Testing in browser:**
1. Open `http://acme.localhost:8000` or `http://globex.localhost:8000`
2. Browser DevTools → Network tab to inspect API calls
3. Console for debugging

### Common Commands

**Backend:**
```bash
php artisan serve                    # Start server
php artisan migrate                  # Run migrations
php artisan seed:fresh              # Seed database
php artisan artisan tinker          # Interactive shell
```

**Frontend:**
```bash
npm install                          # Install dependencies
npm run dev                          # Development server
npm run build                        # Production build
npm run preview                      # Preview production build
```

---

## Troubleshooting Guide

### CORS Errors
**Issue:** "Access to XMLHttpRequest blocked by CORS policy"
**Solution:** Check `EnableCorsMiddleware` is included in `routes/tenant.php`

### Tenant Data Not Updating
**Issue:** Switching tenant shows old data
**Solution:** Ensure page listens to `tenantChangeCount` in useEffect dependencies

### 500 Errors on Update
**Issue:** "database connection [inventory] not configured"
**Solution:** Use `Rule::unique()` instead of hardcoded table names

### Product Edit Not Prepopulating
**Issue:** Form fields empty on edit
**Solution:** Use `fetchProduct(id)` which returns `response.data`

### Order Not Assigned to Customer
**Issue:** Default "Customer" created instead of selected customer
**Solution:** Send full customer object with name, email, phone

---

## Performance Optimizations

**Backend:**
- Use eager loading: `.with('customer', 'items.product')`
- Add database indexes on foreign keys
- Implement query caching with Redis
- Use pagination for large datasets
- Database connection pooling

**Frontend:**
- Code splitting with React.lazy()
- Image optimization with next/image
- Debounce search inputs
- Memoize expensive computations
- Virtual scrolling for large lists

---

## Security Considerations

**Backend:**
- Validate all input with FormRequests
- Use prepared statements (Laravel ORM does this)
- Implement rate limiting
- Add CSRF token to forms
- Sanitize output
- Hash passwords with bcrypt

**Frontend:**
- Never store sensitive data in localStorage
- Sanitize user input before display
- Use Content Security Policy headers
- Validate file uploads
- Use HTTPS in production

---

## Monitoring & Logging

**Backend:**
- Laravel logs: `storage/logs/`
- Set up Error tracking (Sentry, Bugsnag)
- Monitor database performance
- Log all API requests

**Frontend:**
- Browser DevTools Console
- Error tracking (Sentry)
- Analytics (Google Analytics, Mixpanel)
- Performance monitoring

---

## Version Control

**Current Branch:** `backendDev`

**Recommended workflow:**
1. Feature branches: `feature/feature-name`
2. Bug fix branches: `bugfix/issue-name`
3. PR review before merging to `main`
4. Tag releases: `v1.0.0`

---

## Documentation

Keep these updated:
- API documentation (Postman collection)
- Database schema diagram
- Component documentation (Storybook)
- Deployment guide
- Configuration guide

---

## Next Steps

1. **Immediate:** Review and test all current functionality
2. **Week 1:** Implement authentication
3. **Week 2:** Add dashboard analytics
4. **Week 3:** Add search/filtering
5. **Week 4:** Deploy to staging

---

**Last Updated:** December 8, 2025
**Current Status:** MVP Complete - Production Ready for basic OMS operations
