
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export type Client = {
  id?: string;
  firstName: string;
  lastName: string;
  firmName: string;
  email: string;
  mobile: string;
  state: string;
  district: string;
  clientType: string; 
  status: 'active' | 'inactive' | 'pending';
  portalAccess: boolean;
  createdBy: string;
  remarks?: string;
  revenue?: number;
  source?: string;
  visitCount?: number;
  lastVisit?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NewClientData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { password?: string };

export async function addClient(clientData: NewClientData) {
  const { password, ...clientInfo } = clientData;

  const sanitizedClientInfo: { [key: string]: any } = { ...clientInfo };
  Object.keys(sanitizedClientInfo).forEach(key => {
    if (sanitizedClientInfo[key] === undefined) {
      delete sanitizedClientInfo[key];
    }
  });

  try {
    const auth = getAuth();
    if (!password) {
        throw new Error("Password is required to create a client login.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, sanitizedClientInfo.email, password);
    const user = userCredential.user;

    const docRef = doc(db, 'clients', user.uid);
    await setDoc(docRef, {
        ...sanitizedClientInfo,
        portalAccess: sanitizedClientInfo.portalAccess ?? true,
        revenue: sanitizedClientInfo.revenue || 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return user.uid;

  } catch (error: any) {
    console.error("Error adding document and creating user: ", error);
     if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please use a different email.');
    }
    throw new Error("Failed to add client.");
  }
}

export async function registerClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'portalAccess'> & { password?: string }) {
   const { password, ...clientInfo } = clientData;

   try {
     const auth = getAuth();
     if (!password) {
         throw new Error("Password is required to create a client login.");
     }
     const userCredential = await createUserWithEmailAndPassword(auth, clientInfo.email, password);
     const user = userCredential.user;
 
     const docRef = doc(db, 'clients', user.uid);
     await setDoc(docRef, {
         ...clientInfo,
         createdBy: "Client Self-Registration",
         status: 'pending', // Default status for self-registered clients
         portalAccess: true, // Default portal access to true
         revenue: 0,
         createdAt: Timestamp.now(),
         updatedAt: Timestamp.now(),
     });
     return user.uid;
 
   } catch (error: any) {
     console.error("Error during client self-registration: ", error);
      if (error.code === 'auth/email-already-in-use') {
       throw new Error('This email is already registered. Please use a different email or log in.');
     }
     throw new Error("Failed to register client account.");
   }
}

export async function updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>> & { password?: string }) {
  const { password, ...firestoreUpdates } = updates;
  
  try {
    if (password) {
      console.warn("Client-side password update is disabled for security reasons. Please use Firebase Console for password resets.");
    }

    if (Object.keys(firestoreUpdates).length > 0) {
        const clientDoc = doc(db, 'clients', id);
        
        const dataToUpdate: { [key: string]: any } = { ...firestoreUpdates };
        Object.keys(dataToUpdate).forEach(key => {
          if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
        });
        delete dataToUpdate.id; 

        await updateDoc(clientDoc, {
          ...dataToUpdate,
          updatedAt: Timestamp.now(),
        });
    }

  } catch (error) {
    console.error("Error updating client: ", error);
    throw new Error("Failed to update client.");
  }
}

export async function deleteClient(id: string) {
  try {
    const clientDoc = doc(db, 'clients', id);
    await deleteDoc(clientDoc);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw new Error("Failed to delete client.");
  }
}
