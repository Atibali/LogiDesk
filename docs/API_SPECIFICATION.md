# LogiDesk – API Specification (Authentication & User Access)

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### 1.1 Register Customer Account
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "Password123!"
}
```
- **Responses**:
  - `201 Created`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 1,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "Customer",
    "isActive": true,
    "createdAt": "2026-11-20T12:00:00Z"
  }
}
```
  - `400 Bad Request`: Validation failure or `"An account with this email already exists."`

---

### 1.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "jane.doe@example.com",
  "password": "Password123!"
}
```
- **Responses**:
  - `200 OK`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 1,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "Customer",
    "isActive": true,
    "createdAt": "2026-11-20T12:00:00Z"
  }
}
```
  - `401 Unauthorized`: `"Invalid email or password."` or `"Your account has been deactivated. Please contact an administrator."`

---

## 2. User Profile Endpoints

### 2.1 Get Current User Profile
- **Endpoint**: `GET /api/users/me`
- **Access**: Authenticated (`Customer`, `SupportAgent`, `OperationsManager`, `Administrator`)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`:
```json
{
  "userId": 1,
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "role": "Customer",
  "isActive": true,
  "createdAt": "2026-11-20T12:00:00Z"
}
```

---

## 3. Administrative User Management Endpoints (LD-08)

### 3.1 List All Users
- **Endpoint**: `GET /api/admin/users`
- **Access**: `Administrator` only
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`: Array of `UserDto` objects.

### 3.2 Update User Status (Activate/Deactivate)
- **Endpoint**: `PUT /api/admin/users/{userId}/status`
- **Access**: `Administrator` only
- **Request Body**:
```json
{
  "isActive": false
}
```
- **Response**:
  - `200 OK`: Updated `UserDto`

### 3.3 Update User Role
- **Endpoint**: `PUT /api/admin/users/{userId}/role`
- **Access**: `Administrator` only
- **Request Body**:
```json
{
  "role": "SupportAgent"
}
```
- **Response**:
  - `200 OK`: Updated `UserDto`
