
"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  Query,
  DocumentData,
  addDoc,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  AuthErrorCodes,
  updatePassword,
} from 'firebase/auth';
import { db, app, auth as firebaseAuth } from '@/lib/firebase';
import { Role } from './roles';

export type AdminUser = {
  id?: string;
  firstName: string;
  lastName:string;
  email: string;
  mobile: string;
  role: string; // roleId
  roleName?: string; // Display name for the role
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  authUid?: string; // To store the Firebase Auth UID
  fcmToken?: string;
  performanceScore?: number; // Optional
  totalRevenueGenerated?: number; // Optional
  taskCompletionRate?: number; // Optional
};

const usersCollection = collection(db, 'admins');
const clientsCollection = collection(db, 'clients');


// This function now also logs login activity.
export const recordLoginActivity = async (email: string, userType: 'admin' | 'client') => {
    try {
        await addDoc(collection(db, 'login_activity'), {
            email,
            userType,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error("Failed to record login activity:", error);
        // We don't throw an error here, as failing to log is not critical for the login flow itself.
    }
};

type NewUserWithPassword = Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'> & { password: string };

export async function addUser(userData: NewUserWithPassword) {
  const { email, password, ...restOfData } = userData;
  const auth = getAuth(app);
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userDocRef = doc(db, 'admins', user.uid);
    await setDoc(userDocRef, {
      ...restOfData,
      email,
      authUid: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return user.uid;
  } catch (error: any) {
    console.error('Error adding user: ', error);
    if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
      throw new Error('This email address is already in use by another account.');
    } else if (error.code === AuthErrorCodes.WEAK_PASSWORD) {
        throw new Error('The password is too weak. It must be at least 6 characters long.');
    }
    throw new Error('Failed to add user.');
  }
}

export async function updateUser(id: string, updates: Partial<AdminUser> & { password?: string }) {
  const { password, ...firestoreUpdates } = updates;
  const userDocRef = doc(db, 'admins', id);
  const auth = getAuth(app);
  
  try {
     // If a new password is provided, only allow the currently logged-in user to change their own password
     // This is a client-side security measure. A more robust solution involves an admin SDK on the server.
     if (password) {
        const userDoc = await getDoc(userDocRef);
        const userToUpdateUid = userDoc.data()?.authUid;
        
        if (auth.currentUser && auth.currentUser.uid === userToUpdateUid) {
           await updatePassword(auth.currentUser, password);
        } else {
            console.warn("Skipping password update. For security reasons, users can only change their own password from the client. Admin-level password resets for other users should be handled via a server-side function.");
            if (auth.currentUser?.uid !== userToUpdateUid) {
                // Do not throw error, just warn and continue with other updates
                 console.warn("Attempted to change password for another user from the client.");
            }
        }
     }

     await updateDoc(userDocRef, {
        ...firestoreUpdates,
        updatedAt: Timestamp.now(),
      });
  } catch (error: any) {
    console.error('Error updating user: ', error);
    if (error.code === 'auth/requires-recent-login') {
        throw new Error('This action is sensitive and requires recent authentication. Please log out and log back in to update the password.');
    }
    throw new Error(error.message || 'Failed to update user.');
  }
}

export async function deleteUser(id: string) {
  const userDocRef = doc(db, 'admins', id);
  try {
    // Note: This does not delete the Firebase Auth user, only the Firestore document.
    // A server-side function is required to delete the auth user.
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw new Error('Failed to delete user.');
  }
}

// Function to get FCM tokens for a target group
export async function getTokensForTargetGroup(target: { status: "all" | "active" | "inactive" | "pending", types: string[] }): Promise<string[]> {
    let q: Query<DocumentData> = query(clientsCollection);
    
    // Apply status filter
    if (target.status !== 'all') {
        q = query(q, where('status', '==', target.status));
    }

    // Apply client type filter
    if (target.types.length > 0) {
        q = query(q, where('clientType', 'in', target.types));
    }

    try {
        const querySnapshot = await getDocs(q);
        const tokens: string[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            // Assuming the client document has an 'fcmToken' field
            if (data.fcmToken) {
                tokens.push(data.fcmToken);
            }
        });
        return tokens;
    } catch (error) {
        console.error("Error getting tokens for target group:", error);
        return [];
    }
}
