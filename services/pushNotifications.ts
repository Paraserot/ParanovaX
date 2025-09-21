
'use server';

import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export type PushNotification = {
    id?: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    customerStatus: "all" | "active" | "inactive" | "pending";
    customerTypes: string[];
    sendTime: "instant" | "later";
    scheduledDateTime?: string;
    expiry: "today" | "week" | "month" | "never";
    backlink?: string;
    createdAt?: string;
};


async function sendPushNotification(notificationData: Omit<PushNotification, 'id'>) {
    // This is a placeholder. The actual sending logic requires a secure server environment (like Cloud Functions)
    // to handle user tokens and credentials safely. Attempting to use firebase-admin SDK from the client
    // or even a Server Action is not secure or recommended.
    console.log("Simulating push notification send to target group.");
    console.log("Title:", notificationData.title);
    
    // In a real implementation, you would:
    // 1. Trigger a Cloud Function here.
    // 2. The Cloud Function would query users based on `customerStatus` and `customerTypes`.
    // 3. It would then use the Firebase Admin SDK to send messages to the FCM tokens of those users.
    
    // For now, we will just log that the notification would have been sent.
    return Promise.resolve();
}

// Create
export async function addPushNotification(data: Omit<PushNotification, 'id' | 'createdAt'>): Promise<string> {
  try {
    const dataToSave: any = {
      ...data,
      createdAt: Timestamp.now(),
    };
    if (data.scheduledDateTime) {
      dataToSave.scheduledDateTime = new Date(data.scheduledDateTime);
    }
    
    // Save the notification document
    const docRef = await addDoc(collection(db, 'pushNotifications'), dataToSave);
    
    // Immediately "send" the notification if it's not scheduled for later
    if (data.sendTime === 'instant') {
        // This now calls a safe, placeholder function.
        await sendPushNotification(data);
    } else {
        // A scheduled function would be needed to handle 'later' sends.
        console.log(`Notification ${docRef.id} scheduled for ${data.scheduledDateTime}`);
    }

    return docRef.id;
  } catch (error) {
    console.error("Error adding push notification: ", error);
    throw new Error("Failed to add push notification.");
  }
}


// Update
export async function updatePushNotification(id: string, updates: Partial<PushNotification>): Promise<void> {
  const notificationDoc = doc(db, 'pushNotifications', id);
  await updateDoc(notificationDoc, updates);
}

// Delete
export async function deletePushNotification(id: string): Promise<void> {
  const notificationDoc = doc(db, 'pushNotifications', id);
  await deleteDoc(notificationDoc);
}
