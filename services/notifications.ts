
'use server';

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { AdminUser } from './users';
import { Role } from './roles';

export type Notification = {
  id?: string;
  userId: string; // ID of the user this notification is for
  title: string;
  description: string;
  type: 'ticket_created' | 'ticket_updated' | 'task_overdue' | 'push_notification_sent' | 'generic';
  link: string; // e.g., /support/[ticketId]
  read: boolean;
  createdAt: string;
};

const notificationsCollection = collection(db, 'notifications');


// Create a new notification for a specific user and all super admins
export async function createNotification(allUsers: AdminUser[], allRoles: Role[], data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
  try {
    const superAdminRole = allRoles.find(r => r.name.toLowerCase().includes('super'));
    const superAdminRoleId = superAdminRole ? superAdminRole.id : null;

    const usersToNotify: AdminUser[] = [];
    
    // Find the primary user for the notification
    const targetUser = allUsers.find(u => u.id === data.userId);
    if (targetUser) {
        usersToNotify.push(targetUser);
    }
    
    // Find and add all super admins, ensuring no duplicates
    if (superAdminRoleId) {
        const superAdmins = allUsers.filter(u => u.role === superAdminRoleId);
        superAdmins.forEach(admin => {
            if (!usersToNotify.find(u => u.id === admin.id)) {
                usersToNotify.push(admin);
            }
        });
    }
    
    if (usersToNotify.length === 0) {
        console.warn("No users found to send notification to for:", data.title);
        return;
    }

    const batch = writeBatch(db);

    for (const user of usersToNotify) {
        const notificationDocRef = doc(collection(db, 'notifications'));
        batch.set(notificationDocRef, {
          ...data,
          userId: user.id, // Ensure notification is for the correct user
          read: false,
          createdAt: Timestamp.now(),
        });
    }

    await batch.commit();
  } catch (error) {
    console.error("Error creating notification: ", error);
    // Don't re-throw to prevent crashing the caller function, but log it.
  }
}

// Get all notifications for a specific user
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const q = query(notificationsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as Notification;
    });
  } catch (error) {
    console.error("Error getting notifications: ", error);
    throw new Error("Failed to get notifications.");
  }
}

// Mark a notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
  const notificationDoc = doc(db, 'notifications', id);
  await updateDoc(notificationDoc, { read: true });
}

// Mark all notifications for a user as read
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    const q = query(notificationsCollection, where('userId', '==', userId), where('read', '==', false));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return; // No unread notifications to mark
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
    });
    await batch.commit();
}
