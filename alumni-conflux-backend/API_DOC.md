# Alumni Conflux API Documentation

This document lists all available API endpoints, their methods, request bodies, and success responses.

---

## 1. Authentication (`/api/auth`)

### Check Email (Availability & OTP Dispatch)
*   **Endpoint:** `POST /api/auth/check-email`
*   **Request Body:**
```json
{ "email": "john@example.com" }
```
*   **Response (200 OK):**
```json
{ "message": "OTP sent to email" }
```

### Check Username (Availability)
*   **Endpoint:** `POST /api/auth/check-username`
*   **Request Body:**
```json
{ "username": "johndoe" }
```
*   **Response (200 OK):**
```json
{ "message": "Username is available" }
```

### Verify OTP
*   **Endpoint:** `POST /api/auth/verify-otp`
*   **Request Body:**
```json
{
    "email": "john@example.com",
    "otp": "123456"
}
```
*   **Response (200 OK):**
```json
{ "message": "OTP verified successfully" }
```

### Signup (Final Submission)
*   **Endpoint:** `POST /api/auth/signup`
*   **Request Body:**
```json
{
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "otp": "123456",
    "role": "STUDENT" // or "ALUMNI"
}
```
*   **Response (201 Created):**
```json
{
    "userId": 1,
    "id": 1,
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "STUDENT"
}
```

### Login
*   **Endpoint:** `POST /api/auth/login`
*   **Request Body:**
```json
{
    "emailOrUsername": "johndoe", // or "john@example.com"
    "password": "password123"
}
```
*   **Response (200 OK):**
```json
{
    "userId": 1,
    "id": 1,
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "STUDENT"
}
```

---

## 2. Jobs (`/api/jobs`)

### Create Job (Alumni Only)
*   **Endpoint:** `POST /api/jobs/{userId}`
*   **Request Body:**
```json
{
    "title": "Software Engineer",
    "description": "Looking for a full-stack developer.",
    "company": "Tech Corp",
    "location": "Remote",
    "jobType": "Full-time",
    "salary": "$80,000 - $120,000",
    "applyLink": "https://example.com/apply"
}
```

### Update/Delete Job
*   **Endpoint:** `PUT` or `DELETE` `/api/jobs/{userId}/{jobId}`

### Get All Jobs (Feed)
*   **Endpoint:** `GET /api/jobs`

### Search Jobs
*   **Endpoint:** `GET /api/jobs/search?title=Software`

### Apply for a Job
*   **Endpoint:** `POST /api/jobs/{jobId}/apply/{userId}`
*   **Request Body:**
```json
{ "resumeUrl": "https://link-to-resume.pdf" }
```

### View Applications on My Job (Alumni)
*   **Endpoint:** `GET /api/jobs/{jobId}/applications/{userId}`

### View My Applications (Student/Alumni)
*   **Endpoint:** `GET /api/jobs/applications/my/{userId}`

---

## 3. Events (`/api/events`)

### Request Creation (Alumni / Admin)
*   **Endpoint:** `POST /api/events/request/{userId}`
*   **Body Example:**
```json
{
    "title": "Networking Event",
    "description": "Join us for networking.",
    "eventDate": "2026-05-20T19:00:00",
    "location": "Main Hall",
    "targetAudience": "ALL" // ALL, ALUMNI, STUDENT
}
```

### Approve/Reject Event (Admin)
*   **Endpoint:** `PATCH /api/events/{eventId}/status?status=APPROVED`

### Feed (Available Events)
*   **Endpoint:** `GET /api/events/available/{userId}`

### Register for Event
*   **Endpoint:** `POST /api/events/{eventId}/register/{userId}`

### View Event Attendees (Creator/Admin)
*   **Endpoint:** `GET /api/events/{eventId}/attendees/{userId}`

---

## 4. Profile Modules

### Student Profile (`/api/student`)
*   **POST/PUT** `/{userId}`: Create or update profile.
*   **GET** `/{userId}`: Fetch student details.

### Alumni Profile (`/api/alumni`)
*   **POST/PUT** `/{userId}`: Create or update profile.
*   **GET** `/{userId}`: Fetch alumni details.

### Admin Profile (`/api/admin`)
*   **POST/PUT** `/{userId}`: Create or update profile.
*   **GET** `/{userId}`: Fetch admin details.

---

## 5. Other
*   **GET `/api/events/pending`**: View all pending event requests (Admin).
*   **GET `/api/jobs/{jobId}`**: Get single job details.
*   **GET `/api/events/{eventId}`**: Get single event details.
