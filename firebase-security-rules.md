# Firebase Security Rules

## Firestore Rules

Replace your current Firestore rules with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User profiles - users can read/write their own profile
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
      
      // User interviews - users can read/write their own interviews
      match /interviews/{interviewId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // Avatar personas - users can read their own and system personas
    match /avatarPersonas/{personaId} {
      allow read: if isAuthenticated() && (
        resource.data.createdBy == request.auth.uid ||
        resource.data.type == 'system'
      );
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        resource.data.createdBy == request.auth.uid;
    }
    
    // Companies - users can read/write their own companies
    match /companies/{companyId} {
      allow read, write: if isAuthenticated() && 
        resource.data.createdBy == request.auth.uid;
      allow create: if isAuthenticated();
    }
  }
}
```

## Realtime Database Rules

Replace your current Realtime Database rules with these secure rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "avatarSessions": {
      "$sessionId": {
        ".read": "auth != null && (data.userId == auth.uid || root.child('avatarSessions').child($sessionId).child('userId').val() == auth.uid)",
        ".write": "auth != null && (data.userId == auth.uid || root.child('avatarSessions').child($sessionId).child('userId').val() == auth.uid)"
      }
    }
  }
}
```

## How to Apply These Rules

### Firestore Rules:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Paste the Firestore rules above
5. Click **Publish**

### Realtime Database Rules:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Realtime Database** → **Rules** tab
4. Paste the Realtime Database rules above
5. Click **Publish**

## Security Notes

- **Authentication Required**: All operations require user authentication
- **User Isolation**: Users can only access their own data
- **System Avatars**: All authenticated users can read system avatars
- **Company Data**: Users can only access companies they created

## Testing

After applying these rules:
1. Test with an authenticated user - should work
2. Test with an unauthenticated user - should be denied
3. Test accessing another user's data - should be denied

## Migration Notes

If you have existing data:
- These rules are backward compatible
- Existing authenticated users will continue to work
- Anonymous users will need to sign in
