# Frontend Integration Guide - Storemate Auth API

> A comprehensive guide for integrating the Storemate multi-tenant authentication system into the React frontend.

---

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication Architecture](#authentication-architecture)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Multi-Tenancy Setup](#multi-tenancy-setup)
6. [Frontend Implementation](#frontend-implementation)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## API Overview

**Backend:** Laravel 11 with Stancl Tenancy v3  
**Authentication:** Laravel Sanctum (Token-based)  
**Database:** PostgreSQL with per-tenant isolation  
**Multi-Tenancy:** Domain-based (acme.localhost, globex.localhost)

### Key Features:
- ✅ Token-based API authentication (no cookies required)
- ✅ Per-tenant user isolation
- ✅ UUID-based user IDs
- ✅ Role-based access (admin, staff)
- ✅ Simultaneous multi-user sessions
- ✅ CORS enabled for local development

---

## Authentication Architecture

### Flow Diagram:
```
1. User selects tenant (ACME/GLOBEX)
                ↓
2. Browser navigates to tenant domain (acme.localhost or globex.localhost)
                ↓
3. User sees login page
                ↓
4. User submits credentials (email + password)
                ↓
5. Backend validates and returns token + user info
                ↓
6. Frontend stores token (localStorage/sessionStorage)
                ↓
7. Frontend sends token in Authorization header for all API requests
                ↓
8. Backend validates token and tenant context
                ↓
9. Authenticated requests succeed / Unauthenticated requests return 401
```

### Token Structure:
```
Token Format: 1|<hash_string>
Example: 1|7frK3oylKQODkrwSMhcQKReBlYIVvL...

Parts:
- "1" = Token ID (database ID)
- "|" = Separator
- Rest = Hashed token secret
```

---

## API Endpoints

### 1. Get All Tenants (Public - No Auth Required)

**Endpoint:** `GET /api/v1/tenants`  
**Host:** `localhost:8000` (Any domain works, this is central)  
**Auth:** Not required

**Request:**
```bash
curl -X GET http://localhost:8000/api/v1/tenants \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "acme",
      "name": "acme",
      "domain": "acme.localhost"
    },
    {
      "id": "globex",
      "name": "globex",
      "domain": "globex.localhost"
    }
  ]
}
```

**Use Case:** Display tenant selector dropdown on landing page

---

### 2. Login (Public - No Auth Required)

**Endpoint:** `POST /api/v1/login`  
**Host:** `acme.localhost:8000` or `globex.localhost:8000`  
**Auth:** Not required

**Request:**
```bash
curl -X POST http://acme.localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tenant.com",
    "password": "password123"
  }'
```

**Request Body:**
```json
{
  "email": "admin@tenant.com",
  "password": "password123"
}
```

**Response (200 OK):**
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

**Response (422 Unprocessable Entity - Invalid Credentials):**
```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": ["The provided credentials are incorrect."]
  }
}
```

**Use Case:** Authenticate user and obtain token for subsequent requests

---

### 3. Get Current User Info (Protected)

**Endpoint:** `GET /api/v1/me`  
**Host:** `acme.localhost:8000` or `globex.localhost:8000`  
**Auth:** Required (Bearer token)

**Request:**
```bash
curl -X GET http://acme.localhost:8000/api/v1/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|7frK3oylKQODkrwSMhcQKReBlYIVvL..."
```

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

**Response (401 Unauthorized - Missing/Invalid Token):**
```json
{
  "message": "Unauthenticated."
}
```

**Use Case:** Fetch current user data (on app load, to verify session still valid)

---

### 4. Logout (Protected)

**Endpoint:** `POST /api/v1/logout`  
**Host:** `acme.localhost:8000` or `globex.localhost:8000`  
**Auth:** Required (Bearer token)

**Request:**
```bash
curl -X POST http://acme.localhost:8000/api/v1/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1|7frK3oylKQODkrwSMhcQKReBlYIVvL..."
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Use Case:** Clear user session and revoke token

---

## Request/Response Formats

### Standard Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {},
  "tenant": "acme"
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### Common HTTP Status Codes

| Status | Meaning | Scenario |
|--------|---------|----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing/invalid token |
| 422 | Unprocessable Entity | Validation error (invalid credentials) |
| 500 | Server Error | Backend error |

---

## Multi-Tenancy Setup

### Domain Mapping

```
ACME Tenant:
  Domain: acme.localhost:8000
  Database: tenantacme
  API Base: http://acme.localhost:8000/api/v1

GLOBEX Tenant:
  Domain: globex.localhost:8000
  Database: tenantglobex
  API Base: http://globex.localhost:8000/api/v1
```

### How Tenancy Works

1. **Tenant Detection:** Backend detects tenant from domain (acme.localhost → acme tenant)
2. **Database Switching:** Automatically switches to tenant database (tenantacme)
3. **User Isolation:** All queries are scoped to current tenant
4. **Token Isolation:** Tokens only work on their issuing tenant

### Frontend Considerations

- Store current tenant ID in React context
- All API calls must go to correct tenant domain
- Token from acme.localhost will NOT work on globex.localhost
- When user switches tenants, clear token and require re-login

---

## Frontend Implementation

### 1. Axios Setup (api/client.js)

```javascript
import axios from 'axios';

// Create tenant-aware axios instance
export const createApiClient = (tenantDomain) => {
  return axios.create({
    baseURL: `http://${tenantDomain}:8000/api/v1`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
};

// Add token to requests
export const setAuthToken = (api, token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
```

### 2. AuthContext Setup (context/AuthContext.js)

```javascript
import { createContext, useState, useCallback, useEffect } from 'react';
import { createApiClient, setAuthToken } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize API client when tenant changes
  const api = tenant ? createApiClient(`${tenant}.localhost`) : null;

  // Login handler
  const login = useCallback(async (email, password) => {
    if (!api) throw new Error('Tenant not selected');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      
      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tenant', tenant);
      
      // Set token for subsequent requests
      setAuthToken(api, token);
      
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, tenant]);

  // Logout handler
  const logout = useCallback(async () => {
    if (!api || !token) return;
    
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [api, token]);

  // Restore session on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const storedTenant = localStorage.getItem('tenant');
    
    if (storedToken && storedUser && storedTenant) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setTenant(storedTenant);
      
      // Set token for API client
      const restoredApi = createApiClient(`${storedTenant}.localhost`);
      setAuthToken(restoredApi, storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      tenant,
      isLoading,
      error,
      login,
      logout,
      setTenant,
      api,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Login Page (pages/Login.jsx)

```javascript
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const Login = () => {
  const { login, tenant, isLoading, error } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Navigate to dashboard
    } catch (err) {
      // Error is already set in context
    }
  };

  return (
    <div>
      <h1>Login - {tenant}</h1>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
```

### 4. Tenant Selector (components/TenantSelector.jsx)

```javascript
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export const TenantSelector = ({ onSelect }) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setTenant } = useContext(AuthContext);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // Use localhost (central domain) to get all tenants
        const response = await axios.get('http://localhost:8000/api/v1/tenants');
        setTenants(response.data.data);
      } catch (err) {
        console.error('Failed to fetch tenants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleSelectTenant = (tenantId) => {
    setTenant(tenantId);
    onSelect?.(tenantId);
  };

  if (loading) return <div>Loading tenants...</div>;

  return (
    <div>
      <h2>Select Your Organization</h2>
      {tenants.map((tenant) => (
        <button
          key={tenant.id}
          onClick={() => handleSelectTenant(tenant.id)}
        >
          {tenant.name}
        </button>
      ))}
    </div>
  );
};
```

### 5. Protected Route Wrapper (components/ProtectedRoute.jsx)

```javascript
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, token, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

---

## Error Handling

### Common Errors & Solutions

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Unauthenticated | 401 | Missing/invalid token | Redirect to login |
| Invalid credentials | 422 | Wrong email/password | Show error message to user |
| Token expired | 401 | Token revoked/invalid | Clear localStorage, redirect to login |
| Wrong domain | 404/401 | Using token on wrong tenant | Redirect to correct tenant domain |

### Frontend Error Handling Pattern

```javascript
try {
  const response = await api.get('/me');
  setUser(response.data.user);
} catch (error) {
  if (error.response?.status === 401) {
    // Token invalid/expired
    logout();
    navigate('/login');
  } else if (error.response?.status === 422) {
    // Validation error
    setError(error.response.data.message);
  } else {
    // Other error
    setError('Something went wrong');
  }
}
```

---

## Testing

### Test Credentials

**ACME Tenant:**
- Admin: admin@tenant.com / password123 (role: admin)
- Staff: staff@tenant.com / password123 (role: staff)

**GLOBEX Tenant:**
- Admin: admin@tenant.com / password123 (role: admin)
- Staff: staff@tenant.com / password123 (role: staff)

### Manual Testing Checklist

- [ ] Get all tenants endpoint works
- [ ] Login with admin user on ACME
- [ ] Get /me endpoint returns correct user
- [ ] Logout revokes token
- [ ] Can't access protected endpoints without token
- [ ] Login with staff user on GLOBEX
- [ ] Each tenant has isolated users
- [ ] Token from ACME doesn't work on GLOBEX
- [ ] Multiple users can be logged in simultaneously
- [ ] Session persists after page refresh (localStorage)

### Postman Collection

Use the provided `Storemate_Auth_API.postman_collection.json` to test endpoints during development.

---

## Backend API Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/tenants` | ❌ | Get all tenants (public) |
| POST | `/api/v1/login` | ❌ | Login and get token |
| GET | `/api/v1/me` | ✅ | Get current user info |
| POST | `/api/v1/logout` | ✅ | Logout and revoke token |

---

## Important Notes for Frontend Developers

1. **Always include Content-Type and Accept headers**
   ```javascript
   headers: {
     'Content-Type': 'application/json',
     'Accept': 'application/json'
   }
   ```

2. **Token must be included in Authorization header**
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

3. **Tenant domain is critical**
   - Each tenant has its own domain: `{tenantId}.localhost:8000`
   - The backend detects tenant from domain automatically
   - Using wrong domain = 401/404 errors

4. **Token storage strategy**
   - localStorage: Persists across sessions (recommended)
   - sessionStorage: Clears on browser close
   - React state: Clears on page refresh (supplement with localStorage)

5. **CORS is already enabled**
   - No additional CORS headers needed
   - Preflight OPTIONS requests are handled by middleware

6. **Role-based access (for future)**
   - User object includes `role` field (admin/staff)
   - Use this on frontend for UI/UX decisions
   - Backend validation happens at API endpoints

---

## Questions?

For any issues during frontend integration:
1. Check the error response message
2. Verify token is being sent correctly
3. Confirm you're on correct tenant domain
4. Test endpoint in Postman first
5. Check browser console for CORS errors

---

**Last Updated:** December 8, 2025  
**Backend Version:** Laravel 11 with Sanctum v4.2.1  
**Status:** Production Ready ✅
