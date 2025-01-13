import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface ResetPasswordData {
  uid: string;
  newPassword: string;
}

// Helper function to check if user is admin
async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const adminDoc = await admin.firestore().doc('admin/admin').get();
    if (!adminDoc.exists) return false;
    
    const adminData = adminDoc.data();
    return adminData?.users?.includes(uid) || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Get all user emails (admin only)
export const getUserEmails = onCall(async (request) => {
  // Check if user is authenticated and admin
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in');
  }

  try {
    const isAdmin = await isUserAdmin(request.auth.uid);
    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'User must be an admin');
    }

    // Get all users from Firestore
    const usersSnapshot = await admin.firestore().collection('users').get();
    const userIds = usersSnapshot.docs.map(doc => doc.id);

    // Get user details from Auth
    const users = await Promise.all(
      userIds.map(async (uid: string) => {
        try {
          const userRecord = await admin.auth().getUser(uid);
          return {
            uid: userRecord.uid,
            email: userRecord.email,
          };
        } catch (error) {
          console.error(`Error fetching user ${uid}:`, error);
          return {
            uid,
            email: 'Email not found',
          };
        }
      })
    );

    return { users };
  } catch (error) {
    console.error('Error in getUserEmails:', error);
    throw new HttpsError('internal', 'Error fetching user emails');
  }
});

// Reset user password (admin only)
export const resetUserPassword = onCall<ResetPasswordData>(async (request) => {
  // Check if user is authenticated and admin
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in');
  }

  try {
    const isAdmin = await isUserAdmin(request.auth.uid);
    if (!isAdmin) {
      throw new HttpsError('permission-denied', 'User must be an admin');
    }

    const { uid, newPassword } = request.data;
    if (!uid || !newPassword) {
      throw new HttpsError('invalid-argument', 'Missing uid or newPassword');
    }

    await admin.auth().updateUser(uid, {
      password: newPassword,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error in resetUserPassword:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/invalid-password') {
      throw new HttpsError('invalid-argument', 
        'Password must be at least 6 characters long');
    }
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 
        'User not found');
    }
    if (error.code === 'auth/invalid-uid') {
      throw new HttpsError('invalid-argument', 
        'Invalid user ID');
    }
    
    // For any other errors
    throw new HttpsError('internal', 
      `Error resetting password: ${error.message || 'Unknown error'}`);
  }
});
