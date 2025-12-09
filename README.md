# Storemate OMS - Multi-Tenant Order Management System

## Project Overview

Storemate OMS is a **multi-tenant order management system** built with **Laravel 11**, **React 18**, and **PostgreSQL**. It demonstrates advanced concepts like multi-tenancy, role-based access control, token-based authentication, and a modern SPA architecture.

This project is an implementation of the mini multi-module assignment requirements with a focus on:
- ✅ Multi-tenancy using domain-based tenant identification
- ✅ PostgreSQL with central + per-tenant databases
- ✅ REST API with Sanctum authentication
- ✅ React frontend with Axios integration
- ✅ Role-based access control (Admin, Staff)
- ✅ Dashboard with charts and analytics
- ✅ Complete CRUD operations for products, customers, orders, and stocks
- ✅ Docker Compose for local deployment

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Design](#database-design)
5. [Backend Setup & API Documentation](#backend-setup--api-documentation)
6. [Frontend Setup & Architecture](#frontend-setup--architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Multi-Tenancy Implementation](#multi-tenancy-implementation)
9. [Running the Project](#running-the-project)
10. [Assignment Requirements Checklist](#assignment-requirements-checklist)
11. [API Endpoints Reference](#api-endpoints-reference)
12. [Known Issues & Future Improvements](#known-issues--future-improvements)

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Port 5173)             │
│  ├─ Login Page (Tenant Selector)                            │
│  ├─ Dashboard (Charts & Analytics)                          │
│  ├─ Products (CRUD)                                         │
│  ├─ Customers (CRUD)                                        │
│  ├─ Orders (CRUD + Confirm/Cancel)                         │
│  └─ Stocks (View + Create)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │ Axios HTTP Requests
                     │ (Token-based Auth)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Laravel 11 Backend (Port 8000)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ CORS Middleware → API Middleware → Tenancy Init     │   │
│  │ → Sanctum Auth → CSRF Protection                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Central DB (storemate):          Tenant DBs:              │
│  ├─ tenants table                 tenantacme:             │
│  ├─ domains table                 ├─ users                │
│  └─ personal_access_tokens        ├─ products             │
│                                    ├─ customers            │
│                                    ├─ orders               │
│                                    ├─ order_items          │
│                                    └─ stocks               │
│                                                              │
│                                    tenantglobex:          │
│                                    ├─ (same structure)     │
│                                    └─ (separate data)      │
└─────────────────────────────────────────────────────────────┘
          │
          └─ PostgreSQL (Central + Per-Tenant Databases)
```

### Request Flow - Authenticated User

```
1. Frontend Request
   ├─ TenantContext provides tenant domain → "acme.localhost"
   ├─ Axios baseURL: "http://acme.localhost:8000/api/v1"
   ├─ Token from localStorage in Authorization header
   └─ Example: GET http://acme.localhost:8000/api/v1/products

2. Backend Processing
   ├─ EnableCorsMiddleware: Validate CORS headers
   ├─ API Middleware: JSON response formatting
   ├─ InitializeTenancyByDomain: 
   │  └─ Extract domain from Host header
   │  └─ Find tenant in central DB
   │  └─ Switch database connection to tenant DB
   ├─ PreventAccessFromCentralDomains: Block central domain access
   ├─ Sanctum Middleware (auth:sanctum):
   │  └─ Extract token from Authorization header
   │  └─ Validate in personal_access_tokens table
   │  └─ Attach authenticated user to request
   └─ Route Handler: Process request in tenant context

3. Response
   └─ JSON response sent back to frontend
```

---

## Tech Stack

### Backend
- **Framework:** Laravel 11
- **Authentication:** Laravel Sanctum v4.2.1
- **Multi-Tenancy:** Stancl Tenancy v3
- **Database:** PostgreSQL
- **Validation:** FormRequest classes
- **Architecture:** Service-based architecture for business logic

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios with interceptors
- **State Management:** Context API (AuthContext, TenantContext)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Build Tool:** Vite

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Development Server:** PHP's built-in server
- **Database:** PostgreSQL (with pgAdmin for management)

---

## Project Structure

```
Storemate/
├── backend/                          # Laravel 11 Application
│   ├── app/
│   │   ├── Console/
│   │   │   └── Commands/
│   │   │       └── CreateTenant.php  # CLI command to create tenants
│   │   ├── Exceptions/
│   │   │   └── OutOfStockException.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── API/
│   │   │   │       ├── AuthController.php      # Login, logout, me
│   │   │   │       ├── ProductController.php   # Product CRUD
│   │   │   │       ├── CustomerController.php  # Customer CRUD
│   │   │   │       ├── OrderController.php     # Order CRUD + Actions
│   │   │   │       ├── StockController.php     # Stock management
│   │   │   │       └── TenantController.php    # List tenants (public)
│   │   │   ├── Requests/
│   │   │   │   ├── StoreProductRequest.php
│   │   │   │   ├── StoreCustomerRequest.php
│   │   │   │   ├── StoreOrderRequest.php
│   │   │   │   └── StoreStockRequest.php
│   │   │   └── Middleware/
│   │   │       └── EnableCorsMiddleware.php
│   │   ├── Models/
│   │   │   ├── User.php              # UUID primary key, per-tenant
│   │   │   ├── Product.php
│   │   │   ├── Customer.php
│   │   │   ├── Order.php
│   │   │   ├── OrderItem.php
│   │   │   ├── Stock.php
│   │   │   ├── Tenant.php            # Central DB model
│   │   │   └── Domain.php            # Central DB model
│   │   ├── Services/
│   │   │   └── OrderService.php      # Business logic for orders
│   │   └── Providers/
│   │       ├── AppServiceProvider.php
│   │       └── TenancyServiceProvider.php
│   ├── bootstrap/
│   │   ├── app.php                   # Middleware configuration
│   │   └── providers.php
│   ├── config/
│   │   ├── app.php
│   │   ├── auth.php
│   │   ├── database.php
│   │   ├── sanctum.php               # Token expiration settings
│   │   ├── tenancy.php               # Stancl Tenancy config
│   │   └── ... (other configs)
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 0001_01_01_000000_create_users_table.php
│   │   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   │   ├── 2019_09_15_000010_create_tenants_table.php
│   │   │   ├── 2019_09_15_000020_create_domains_table.php
│   │   │   └── tenant/               # Per-tenant migrations
│   │   │       ├── 2025_12_08_000001_create_users_table.php
│   │   │       ├── 2025_12_08_000002_create_products_table.php
│   │   │       ├── 2025_12_08_000003_create_customers_table.php
│   │   │       ├── 2025_12_08_000004_create_orders_table.php
│   │   │       ├── 2025_12_08_000005_create_order_items_table.php
│   │   │       ├── 2025_12_08_000006_create_stocks_table.php
│   │   │       └── 2025_12_08_110000_create_personal_access_tokens_table.php
│   │   ├── factories/
│   │   │   └── UserFactory.php
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       └── InventoryDemoSeeder.php
│   ├── routes/
│   │   ├── api.php                   # Central routes (GET /api/v1/tenants)
│   │   ├── tenant.php                # Tenant-specific routes (all CRUD)
│   │   ├── web.php
│   │   └── console.php
│   ├── storage/
│   ├── tests/
│   ├── vendor/
│   ├── artisan
│   ├── composer.json
│   ├── docker-compose.yml
│   └── README.md
│
├── frontend/                         # React 18 Application
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js        # Axios setup with interceptors
│   │   │   ├── authApi.js            # Auth endpoints
│   │   │   ├── productApi.js         # Product endpoints
│   │   │   ├── customerApi.js        # Customer endpoints
│   │   │   ├── orderApi.js           # Order endpoints
│   │   │   └── stockApi.js           # Stock endpoints
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── Loading.jsx           # Loading spinner
│   │   │   ├── ErrorBox.jsx          # Error display
│   │   │   └── ProtectedRoute.jsx    # Auth guard component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state & login/logout
│   │   │   ├── TenantContext.jsx     # Tenant selection & baseURL
│   │   │   └── useAuth.js            # Auth hook
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Tenant selector + login form
│   │   │   ├── Dashboard.jsx         # Analytics dashboard
│   │   │   ├── products/
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── ProductCreate.jsx
│   │   │   │   └── ProductEdit.jsx
│   │   │   ├── customers/
│   │   │   │   ├── CustomerList.jsx
│   │   │   │   ├── CustomerCreate.jsx
│   │   │   │   └── CustomerEdit.jsx
│   │   │   ├── orders/
│   │   │   │   ├── OrderList.jsx
│   │   │   │   ├── OrderCreate.jsx
│   │   │   │   └── OrderDetail.jsx
│   │   │   └── stocks/
│   │   │       ├── StockList.jsx
│   │   │       └── StockCreate.jsx
│   │   ├── App.jsx                   # Route configuration
│   │   ├── main.jsx                  # Entry point
│   │   ├── index.css
│   │   └── App.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── README.md
│
└── docker-compose.yml                # Multi-container orchestration
```

---

## Database Design

### Central Database: `storemate`

**Purpose:** Stores tenant metadata and domain mappings (Single database for all tenants)

#### `tenants` Table
```sql
CREATE TABLE tenants (
    id VARCHAR(255) PRIMARY KEY,
    data JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```
- `id`: Unique tenant identifier (e.g., "acme", "globex")
- `data`: JSON column for flexible tenant metadata (name, settings, etc.)

#### `domains` Table
```sql
CREATE TABLE domains (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(255),
    domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```
- Maps domain names to tenants (e.g., "acme.localhost" → "acme" tenant)
- Enables domain-based tenant detection

#### `personal_access_tokens` Table
```sql
CREATE TABLE personal_access_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tokenable_type VARCHAR(255),
    tokenable_id CHAR(36),
    name VARCHAR(255),
    token VARCHAR(80) UNIQUE,
    abilities JSON,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```
- Stores API tokens for Sanctum authentication
- `tokenable_id` uses UUID polymorphism for tenant-aware token lookup

---

### Tenant Databases: `tenantacme`, `tenantglobex`, etc.

**Purpose:** Isolated data for each tenant

Each tenant database has the following structure:

#### `users` Table
```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,            -- UUID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    remember_token VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```
- UUID primary key for security
- Role-based access: admin (full access), staff (limited access)

#### `products` Table
```sql
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `customers` Table
```sql
CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### `orders` Table
```sql
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,
    customer_id CHAR(36) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'shipped') DEFAULT 'pending',
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```
- Status workflow: pending → confirmed → shipped / cancelled
- Soft-delete support: `deleted_at` timestamp (for recovery)

#### `order_items` Table
```sql
CREATE TABLE order_items (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### `stocks` Table
```sql
CREATE TABLE stocks (
    id CHAR(36) PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL,
    batch_code VARCHAR(100),
    received_at DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```
- Track inventory levels per product
- FIFO stock deduction logic (orders consume stocks in batch order)

---

## Backend Setup & API Documentation

### Prerequisites
- PHP 8.2+
- PostgreSQL 12+
- Composer
- Docker (optional, for container setup)

### Installation

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Create central database and run migrations
php artisan migrate

# Create tenants
php artisan tenant:create acme acme.localhost
php artisan tenant:create globex globex.localhost

# Run tenant migrations
php artisan tenants:migrate

# Seed demo data (optional)
php artisan db:seed --class=DatabaseSeeder
php artisan tenants:seed --class=InventoryDemoSeeder
```

### Running the Backend

```bash
# Development server
php artisan serve

# The backend will be available at http://localhost:8000
```

### Database Connections

The application automatically routes requests to the correct database based on the domain:

- **Central Domains:** `localhost`, `127.0.0.1`
  - Database: `storemate` (PostgreSQL)
  - Used for tenant metadata and token management

- **Tenant Domains:** `acme.localhost`, `globex.localhost`
  - Databases: `tenantacme`, `tenantglobex` (PostgreSQL)
  - Routed automatically by Stancl Tenancy middleware

---

## API Endpoints Reference

### Authentication Endpoints (Tenant-Specific)

```
POST   /api/v1/login          # Login with email & password
GET    /api/v1/me             # Get authenticated user info (auth:sanctum)
POST   /api/v1/logout         # Logout user (auth:sanctum)
```

**Example Login Request:**
```bash
curl -X POST http://acme.localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tenant.com","password":"password123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "plaintext_token_here",
  "user": {
    "id": "uuid-here",
    "name": "Admin User",
    "email": "admin@tenant.com",
    "role": "admin"
  },
  "tenant": "acme"
}
```

### Products Endpoints (auth:sanctum required)

```
GET    /api/v1/products              # List all products (paginated)
POST   /api/v1/products              # Create product
GET    /api/v1/products/{id}         # Get single product
PUT    /api/v1/products/{id}         # Update product
DELETE /api/v1/products/{id}         # Delete product (cascade check)
```

### Customers Endpoints (auth:sanctum required)

```
GET    /api/v1/customers             # List all customers
POST   /api/v1/customers             # Create customer
GET    /api/v1/customers/{id}        # Get single customer
PUT    /api/v1/customers/{id}        # Update customer
DELETE /api/v1/customers/{id}        # Delete customer (with order check)
```

### Orders Endpoints (auth:sanctum required)

```
GET    /api/v1/orders                # List all orders
POST   /api/v1/orders                # Create order (validates stock)
GET    /api/v1/orders/{id}           # Get single order with items
POST   /api/v1/orders/{id}/confirm   # Confirm pending order
POST   /api/v1/orders/{id}/cancel    # Cancel order
DELETE /api/v1/orders/{id}           # Delete order
```

### Stocks Endpoints (auth:sanctum required)

```
GET    /api/v1/stocks                # List all stocks
POST   /api/v1/stocks                # Add stock batch
GET    /api/v1/stocks/{id}           # Get single stock entry
DELETE /api/v1/stocks/{id}           # Delete stock entry
GET    /api/v1/products/{id}/stocks  # Get all stocks for product
```

### Tenants Endpoint (Public - No Auth Required)

```
GET    /api/v1/tenants               # List all available tenants
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "acme",
      "name": "ACME Corp",
      "domain": "acme.localhost"
    },
    {
      "id": "globex",
      "name": "Globex Inc",
      "domain": "globex.localhost"
    }
  ]
}
```

---

## Frontend Setup & Architecture

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Create environment files
cp .env.example .env.development
cp .env.example .env.production
```

### Environment Configuration

**.env.development:**
```
VITE_API_BASE_URL=http://localhost:8000
```

**.env.production:**
```
VITE_API_BASE_URL=http://localhost:8000
```

### Running the Frontend

```bash
# Development server with hot reload
npm run dev

# The frontend will be available at http://localhost:5173
```

### Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

---

## Frontend Architecture

### State Management

#### AuthContext
Manages authentication state and login/logout operations.

```javascript
// Usage in components
const { user, token, login, logout, isAuthenticated } = useAuth();

// Login flow
await login(email, password);

// Logout flow
await logout();
```

**State:**
- `user`: Current user object (id, name, email, role)
- `token`: Sanctum access token
- `isLoading`: Authentication state loading indicator
- `isAuthenticated`: Boolean flag for route protection
- `error`: Error message from auth operations

**Features:**
- Synchronous session restoration from localStorage
- Token persistence across page refreshes
- Automatic token attachment to all requests via interceptor
- 401 response handling (auto-logout on token expiration)

#### TenantContext
Manages tenant selection and axios baseURL switching.

```javascript
// Usage in components
const { tenant, tenants, switchTenant, tenantChangeCount } = useContext(TenantContext);

// Switch tenant (only used during login)
switchTenant(selectedTenant);
```

**State:**
- `tenant`: Currently selected tenant object { id, name, domain }
- `tenants`: Array of all available tenants
- `isLoading`: Tenant list fetch loading state
- `tenantChangeCount`: Increment counter to trigger data refetches

**Features:**
- Fetches tenant list from `/api/v1/tenants` on app mount
- Restores saved tenant from localStorage
- Updates axios baseURL when tenant changes
- Persists tenant selection across page refreshes
- Triggers re-fetch of data pages when tenant changes

### Axios Client with Interceptors

**Request Interceptor:**
```javascript
// Automatically attaches token to all requests
if (token) {
  headers.Authorization = `Bearer ${token}`;
}
```

**Response Interceptor:**
```javascript
// Handles 401 errors (expired/invalid token)
if (error.response?.status === 401 && localStorage.getItem("authToken")) {
  // Clear auth data and redirect to login
  localStorage.removeItem("authToken");
  window.location.href = "/login";
}
```

### Component Architecture

#### Pages
- **Login.jsx**: Tenant selector + login form
- **Dashboard.jsx**: Analytics dashboard with charts
- **ProductList.jsx**: CRUD operations for products
- **CustomerList.jsx**: CRUD operations for customers
- **OrderList.jsx**: Order management with status workflow
- **StockList.jsx**: Inventory tracking

#### Components
- **ProtectedRoute.jsx**: Wraps routes requiring authentication
- **Navbar.jsx**: Navigation bar (only visible when authenticated)
- **Loading.jsx**: Loading spinner component
- **ErrorBox.jsx**: Error message display

### Data Flow

```
User Action (e.g., fetch products)
    ↓
Component useEffect triggers
    ↓
Calls API function (e.g., fetchProducts)
    ↓
Axios Client
    ├─ Uses TenantContext's baseURL (e.g., http://acme.localhost:8000/api/v1)
    ├─ Request Interceptor adds token from AuthContext
    └─ Makes HTTP request
    ↓
Backend receives request
    ├─ Middleware validates token
    ├─ Initializes tenant context based on domain
    └─ Executes controller action
    ↓
Backend sends response
    ↓
Response Interceptor checks status
    ├─ 200-299: Return data
    ├─ 401: Clear auth and redirect to login
    └─ Other errors: Throw error
    ↓
Component receives data
    ├─ Updates state (setProducts, etc.)
    ├─ Shows content or error message
    └─ Re-renders UI
```

---

## Authentication & Authorization

### Token-Based Authentication (Sanctum)

1. **Login Request:**
   ```javascript
   POST /api/v1/login
   { "email": "admin@tenant.com", "password": "password123" }
   ```

2. **Backend Response:**
   ```json
   {
     "token": "plaintext_token_xyz123",
     "user": { "id": "...", "name": "Admin", "role": "admin" }
   }
   ```

3. **Frontend Storage:**
   ```javascript
   localStorage.setItem("authToken", token);
   localStorage.setItem("authUser", JSON.stringify(user));
   ```

4. **Subsequent Requests:**
   ```
   Authorization: Bearer plaintext_token_xyz123
   ```

5. **Backend Token Validation:**
   - Extract token from Authorization header
   - Query `personal_access_tokens` table
   - Verify token matches and is not expired
   - Load user from `tokenable_id` (UUID morphs)
   - Attach user to request

### Token Storage & Security

- **Plaintext in localStorage:** For simplicity (production: consider httpOnly cookies)
- **Hashed in database:** Sanctum stores hashed version in `personal_access_tokens.token`
- **No expiration:** `expires_at` is NULL (tokens are persistent)
- **Per-tenant tokens:** Stored in each tenant's database

### Role-Based Access Control (RBAC)

Users have two roles:
- **admin**: Full access to all operations
- **staff**: Limited access (view only for sensitive operations)

**Implementation:**
```php
// In controllers
if ($user->role !== 'admin') {
    return response()->json(['message' => 'Unauthorized'], 403);
}
```

**Future Enhancement:** Use Laravel Policies for cleaner authorization.

### Password Hashing

```php
// Register/Reset
$user->password = Hash::make('password123');

// Login verification
if (!Hash::check($submittedPassword, $user->password)) {
    throw ValidationException::withMessages([...]);
}
```

---

## Multi-Tenancy Implementation

### Architecture: Domain-Based Tenant Identification

The system uses **domain-based multi-tenancy** with **per-tenant databases**.

### Flow: How a Request Routes to the Correct Tenant

```
1. Browser Request
   ├─ URL: http://acme.localhost:5173/products
   ├─ Frontend TenantContext determines domain: "acme.localhost"
   └─ Axios makes request to: http://acme.localhost:8000/api/v1/products

2. Backend Receives Request
   ├─ HTTP Host header: "acme.localhost:8000"
   └─ Laravel middleware processes...

3. EnableCorsMiddleware
   ├─ Validates CORS headers
   ├─ Allows origins: localhost:5173, 127.0.0.1:5173
   └─ Adds CORS response headers

4. InitializeTenancyByDomain (Stancl Tenancy)
   ├─ Extracts domain from Host header: "acme"
   ├─ Queries central DB: SELECT * FROM domains WHERE domain = 'acme.localhost'
   ├─ Finds tenant_id: "acme"
   ├─ Loads Tenant::find('acme')
   ├─ Sets database connection to: "tenantacme" database
   └─ All subsequent queries use this database!

5. Sanctum Auth Middleware
   ├─ Extracts token from Authorization header
   ├─ Queries tokenable_user in TENANT database
   ├─ If token is valid: Load user from current tenant DB
   └─ Attach $request->user() for route

6. Route Handler (e.g., ProductController)
   ├─ Query: Product::all()
   ├─ Uses current tenant database: tenantacme
   ├─ Returns products from ACME tenant only ✅

7. Response
   └─ JSON response sent to frontend
```

### Database Switching Mechanism

**Stancl Tenancy Bootstrappers:**

```php
// Automatically initialized for each tenant request
DatabaseTenancyBootstrapper      // Switch database connection
CacheTenancyBootstrapper         // Isolate cache by tenant
FilesystemTenancyBootstrapper    // Isolate storage by tenant
QueueTenancyBootstrapper         // Isolate queues by tenant
```

**Central Domains (Ignored):**
```php
// config/tenancy.php
'central_domains' => ['127.0.0.1', 'localhost']
```

Requests to central domains use central database only.

### Tenant Database Structure

```
PostgreSQL
├── storemate (Central Database)
│   ├── tenants
│   ├── domains
│   └── personal_access_tokens
│
├── tenantacme (Tenant Database for ACME)
│   ├── users
│   ├── products
│   ├── customers
│   ├── orders
│   ├── order_items
│   └── stocks
│
└── tenantglobex (Tenant Database for Globex)
    ├── users
    ├── products
    ├── customers
    ├── orders
    ├── order_items
    └── stocks
```

### Creating New Tenants

```bash
# Command
php artisan tenant:create {id} {domain}

# Example
php artisan tenant:create acme acme.localhost

# This:
# 1. Creates entry in tenants table: id='acme'
# 2. Creates entry in domains table: domain='acme.localhost', tenant_id='acme'
# 3. Creates database: tenantacme
# 4. Runs migrations in tenantacme
```

### Frontend Tenant Switching

```javascript
// TenantContext.jsx
const switchTenant = (t) => {
  setTenant(t);
  // Update axios baseURL to new tenant's domain
  setTenantBaseURL(t.domain);  // http://globex.localhost:8000/api/v1
  // Persist selection
  localStorage.setItem("selectedTenant", JSON.stringify(t));
  // Trigger data refetch
  setTenantChangeCount((prev) => prev + 1);
};
```

All subsequent API requests use the new tenant's domain and database!

---

## Running the Project

### Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Wait for PostgreSQL to initialize (~10 seconds)
sleep 10

# Enter backend container
docker-compose exec backend bash

# Run migrations
php artisan migrate
php artisan tenants:migrate

# Create tenants
php artisan tenant:create acme acme.localhost
php artisan tenant:create globex globex.localhost

# Exit container
exit

# Access the application
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
# pgAdmin:  http://localhost:5050
```

### Manual Setup (Without Docker)

**Backend:**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure PostgreSQL in .env
php artisan migrate
php artisan tenant:create acme acme.localhost
php artisan tenant:create globex globex.localhost
php artisan tenants:migrate
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend:  http://localhost:8000

---

## Assignment Requirements Checklist

### Core Requirements

- ✅ **Multi-module system similar to Storemate OMS**
  - Status: Implemented with Products, Customers, Orders, Stocks modules

- ✅ **PostgreSQL database with schemas**
  - Status: Central database (storemate) + per-tenant databases (tenantacme, tenantglobex)

- ✅ **Database tables**
  - Status: products, customers, orders, order_items, stocks (plus users, personal_access_tokens)

- ✅ **Laravel 11 backend with REST APIs**
  - Status: Fully implemented with proper routing and controllers

- ✅ **FormRequest validation**
  - Status: StoreProductRequest, StoreCustomerRequest, StoreOrderRequest, StoreStockRequest

- ✅ **Service classes for business logic**
  - Status: OrderService for order processing

- ✅ **Basic tenant resolver using Laravel middleware**
  - Status: Implemented using Stancl Tenancy (domain-based, multi-tenant ready)

- ✅ **React frontend modules**
  - Status: Products, Customers, Orders, Stocks with List/Create/Edit views

- ✅ **Axios integration with Laravel APIs**
  - Status: Complete with interceptors, token handling, error management

- ✅ **Loading/error states**
  - Status: Loading spinners, error boxes, action-level error handling

- ✅ **API error handling**
  - Status: Response interceptor handles 401, validation errors, network errors

- ✅ **Database design documentation**
  - Status: Comprehensive schema documentation above

- ✅ **API endpoints documentation**
  - Status: Full endpoint reference above

- ✅ **System architecture documentation**
  - Status: Complete architecture overview above

### Enhanced Requirements

- ✅ **Role-based access control**
  - Status: Admin/Staff roles implemented (frontend: role shown, backend: role validation)

- ✅ **Dashboard with charts**
  - Status: Analytics dashboard with product/order/customer/stock counts and order trend chart

- ✅ **FIFO stock deduction logic**
  - Status: Implemented in OrderService (processes stocks in date-received order)

- ⏳ **NestJS tenant router service**
  - Status: Not implemented (assignment asked for NestJS, but focused on Laravel + React core)

- ⏳ **NestJS BullMQ queue system**
  - Status: Not implemented (could be added for email notifications)

- ⏳ **Soft-delete recovery logic**
  - Status: Partially implemented (models support soft deletes, recovery UI not built)

- ⏳ **Export functionality (CSV/Excel)**
  - Status: Not yet implemented (can be added)

- ⏳ **API rate limiting**
  - Status: Not implemented (can use Laravel rate limiting middleware)

- ⏳ **Database transaction logging for audit**
  - Status: Not implemented (can use Laravel audit packages)

- ⏳ **Unit tests for services/controllers**
  - Status: Minimal tests (can be expanded)

- ✅ **Docker Compose deployment**
  - Status: docker-compose.yml provided for local setup

---

## Known Issues & Future Improvements

### Known Limitations

1. **TenantContext Async Initialization**
   - On app refresh, there's a ~100-200ms delay before tenant loads
   - Data pages show loading state during this time
   - Not a functional issue, just UX refinement opportunity

2. **No Soft-Delete Recovery UI**
   - Soft deletes work in database but no recovery endpoint/UI

3. **No API Rate Limiting**
   - Currently unlimited requests per tenant

4. **No Email Notifications**
   - Order confirmations/cancellations don't send emails (queue system not implemented)

5. **No Excel Export**
   - Data exports to CSV only (no Excel/XLSX support)

### Future Enhancements

1. **Performance Optimizations**
   - Cache tenant list in localStorage to reduce API calls
   - Implement pagination optimization
   - Add database indexes for common queries

2. **Security Enhancements**
   - Move auth tokens to httpOnly cookies
   - Implement CSRF tokens for state-changing requests
   - Add rate limiting per tenant

3. **Feature Additions**
   - NestJS queue system for background jobs
   - Email notifications for order status changes
   - Product/Order analytics export (CSV, Excel, PDF)
   - Soft-delete recovery UI
   - Advanced filtering and search
   - Bulk operations (delete, update multiple)

4. **Testing**
   - Expand unit test coverage for services
   - Add integration tests for API endpoints
   - Frontend component testing with Vitest/React Testing Library

5. **DevOps**
   - Production Docker setup with Nginx
   - CI/CD pipeline configuration
   - Database backup/restore procedures
   - Monitoring and logging setup

6. **Code Quality**
   - Add pre-commit hooks (ESLint, PHP-CS-Fixer)
   - API documentation with Swagger/OpenAPI
   - Component storybook for frontend

---

## Demo Credentials

After seeding the database, you can log in with:

**Admin Account:**
- Email: `admin@tenant.com`
- Password: `password123`
- Role: Admin (full access)

**Staff Account:**
- Email: `staff@tenant.com`
- Password: `password123`
- Role: Staff (limited access)

Available for both ACME and Globex tenants.

---

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
php artisan serve --port=8001
```

**Database connection error:**
- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure databases exist: `storemate`, `tenantacme`, `tenantglobex`

**Migrations failed:**
```bash
php artisan migrate:reset
php artisan migrate
php artisan tenants:migrate
```

### Frontend Issues

**Port 5173 already in use:**
```bash
npm run dev -- --port 5174
```

**API requests failing:**
- Check backend is running on port 8000
- Verify CORS headers are correct in EnableCorsMiddleware
- Check browser console for specific error messages

**Token expired/Invalid:**
- Log out and log back in
- Check localStorage for `authToken` and `selectedTenant`
- Verify token hasn't been deleted in database

---

## Contributing

When adding new features, ensure:
1. Backend: Create FormRequest for validation, Service for logic, Controller to handle request
2. Frontend: Create component with proper error/loading states, integrate with axios client
3. Both: Update documentation with new endpoints/components
4. Tests: Add corresponding test files

---

## Project Status

- **Phase 1:** ✅ Core authentication and multi-tenancy
- **Phase 2:** ✅ CRUD operations for all modules
- **Phase 3:** ✅ Dashboard and analytics
- **Phase 4:** ⏳ Advanced features (queues, exports, soft-deletes)
- **Phase 5:** ⏳ Production deployment and testing

---

## License

This project is part of an assignment and is provided as-is for educational purposes.

---

## Support & Questions

For questions about the codebase:
1. Check the relevant documentation above
2. Review inline code comments
3. Check the git commit history for context
4. Refer to official documentation for frameworks (Laravel, React, Sanctum, Stancl Tenancy)

---

**Last Updated:** December 9, 2025
**Version:** 1.0.0
