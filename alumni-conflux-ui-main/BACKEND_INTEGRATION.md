# Backend Integration Guide

## Quick Start

### 1. Update API Base URL
Edit `src/services/api.ts`:
```typescript
const API_BASE_URL = "https://your-api.com/api";
```

### 2. Replace Service Methods
Replace stub methods with actual API calls:

```typescript
// Before
export const mentorsService = {
  getAll: async () => Promise.resolve({ success: true, data: [] })
};

// After
export const mentorsService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/mentors`);
      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
```

### 3. Using Components with Real Data
All screens already work with API data through custom hooks:

```typescript
// Screen automatically handles loading, error, search
const { items: mentors, loading, error, refetch } = useList(
  () => mentorsService.getAll().then(res => res.data || [])
);
```

## File Structure

### Services (`src/services/`)
- **api.ts** - All API calls, easy to replace

### Hooks (`src/hooks/`)
- **useAsync.ts** - Custom hooks for state management

### Types (`src/types/`)
- **models.ts** - TypeScript interfaces for all data models

### Components (`src/components/`)
- **Reusable components** - Card, SearchBar, StatCard, EmptyState, etc.

## API Endpoints Expected

### Authentication
- `POST /auth/login` - { email, password }
- `POST /auth/signup` - { name, email, username, password }
- `POST /auth/forgot-password` - { email }
- `POST /auth/reset-password` - { email, code, newPassword }

### Mentors
- `GET /mentors` - Get all mentors
- `GET /mentors/:id` - Get mentor details
- `GET /mentors/search?q=query` - Search mentors
- `POST /mentor-requests` - Send mentor request
- `GET /mentor-requests/:id` - Get request status

### Jobs
- `GET /jobs` - Get all jobs
- `GET /jobs/:id` - Get job details
- `GET /jobs/search?q=query` - Search jobs
- `POST /jobs/:id/apply` - Apply for job
- `GET /applications` - Get user's applications

### Events
- `GET /events` - Get all events
- `GET /events/:id` - Get event details
- `GET /events/search?q=query` - Search events
- `POST /events/:id/register` - Register for event
- `GET /registrations` - Get user's registrations

### Sessions
- `GET /sessions` - Get mentor sessions
- `GET /sessions/:id` - Get session details
- `POST /sessions` - Schedule session
- `PATCH /sessions/:id` - Update session

### Profile
- `GET /users/:id/profile` - Get user profile
- `PATCH /users/:id/profile` - Update profile
- `POST /users/:id/avatar` - Upload avatar
- `POST /auth/logout` - Logout

## Response Format

All endpoints should return:
```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Error Handling

Errors are automatically handled by useAsync hook:
```typescript
const { data, loading, error, execute } = useAsync(apiCall);

if (error) {
  Toast.show({ type: 'error', text1: error });
}
```

## Authentication Token

Update api.ts to include auth token in requests:
```typescript
const getAuthToken = async () => {
  // Get from AsyncStorage or state management
  const token = await AsyncStorage.getItem('authToken');
  return token;
};

const headers = {
  'Authorization': `Bearer ${await getAuthToken()}`,
  'Content-Type': 'application/json',
};
```

## Example: Integrating Mentors Endpoint

1. **Update api.ts:**
```typescript
export const mentorsService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/mentors`);
    const json = await response.json();
    return { success: response.ok, data: json.data };
  },
};
```

2. **Screen uses it automatically:**
```typescript
// No changes needed in screen - hook handles everything
const { items: mentors, loading, error } = useList(
  () => mentorsService.getAll().then(res => res.data || [])
);
```

3. **UI updates automatically:**
- While loading → LoadingState
- If error → EmptyState with retry
- If success → List of mentors
- Search works out of the box

## Testing

Mock services for testing:
```typescript
// src/services/__mocks__/api.ts
export const mentorsService = {
  getAll: async () => ({
    success: true,
    data: [{ id: '1', name: 'Test Mentor' }]
  }),
};
```

## Best Practices

1. ✅ Always return ApiResponse format
2. ✅ Use custom hooks - don't call services directly
3. ✅ Components accept data through props
4. ✅ Handle loading states with LoadingState component
5. ✅ Show errors with Toast notifications
6. ✅ Use TypeScript types from models.ts

## Next Steps

1. Set up backend endpoints matching the structure
2. Update API_BASE_URL
3. Replace service methods with real API calls
4. Test with actual data
5. Deploy! 🚀
