
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client } from './clients';
import { TicketCategory, getTicketCategories } from './ticket-categories';
import { AdminUser } from './users';
import { createNotification } from './notifications';
import { getRoles, Role } from './roles';

export type TicketRemark = {
    author: string;
    comment: string;
    createdAt: string; // Changed to string for serialization
    attachmentUrl?: string;
}

export type Ticket = {
  id?: string;
  ticketNumber?: string;
  title: string;
  description: string;
  client: Partial<Client> & { id: string };
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  category: string; // The name of the category
  assignee: {
    id: string;
    name: string;
    mobile?: string;
  };
  dueDate?: string | null;
  remarks?: TicketRemark[];
  attachmentUrl?: string;
  ticketSource?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
};

const ticketsCollection = collection(db, 'tickets');

// Helper to get next ticket number
async function getNextTicketNumber(): Promise<string> {
    const counterRef = doc(db, 'counters', 'tickets');
    const counterSnap = await getDoc(counterRef);
    let newCount = 1;
    if (counterSnap.exists()) {
        newCount = (counterSnap.data().current_number || 0) + 1;
        await updateDoc(counterRef, { current_number: newCount });
    } else {
        await setDoc(counterRef, { current_number: newCount });
    }
    return newCount.toString().padStart(6, '0');
}


// Create
export async function addTicket(ticketData: Partial<Ticket> & { assigneeId?: string }, adminUsers: AdminUser[]) {
  try {
    const { assigneeId, ...restTicketData } = ticketData;
    const ticketNumber = await getNextTicketNumber();
    
    let finalAssignee: Ticket['assignee'];

    const ticketCategories = await getTicketCategories();
    const selectedCategory = ticketCategories.find(c => c.name === ticketData.category);
    
    if (selectedCategory && selectedCategory.assignedTo?.id) {
        // Auto-assignment
        finalAssignee = {
            id: selectedCategory.assignedTo.id,
            name: selectedCategory.assignedTo.name,
            mobile: selectedCategory.assignedTo.mobile || ''
        };
    } else if (assigneeId) {
        // Manual assignment
        const selectedUser = adminUsers.find(u => u.id === assigneeId);
        if (!selectedUser) throw new Error("Manual assignee not found.");
        finalAssignee = {
            id: selectedUser.id!,
            name: `${selectedUser.firstName} ${selectedUser.lastName}`,
            mobile: selectedUser.mobile
        };
    } else {
        throw new Error("No assignee could be determined for this ticket.");
    }

    const remarks = restTicketData.remarks?.map(r => ({ ...r, createdAt: Timestamp.now() })) || [];
    
    const docRef = await addDoc(ticketsCollection, {
        ...restTicketData,
        remarks,
        assignee: finalAssignee,
        ticketNumber,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        closedAt: null,
    });

    // Send notification
    const allRoles = await getRoles();
    await createNotification(adminUsers, allRoles, {
        userId: finalAssignee.id,
        title: `New Ticket #${ticketNumber}`,
        description: `A new ticket has been assigned to you: "${ticketData.title}"`,
        link: `/admin/support/${docRef.id}`,
        type: 'ticket_created'
    });
    
    return docRef.id;
  } catch (error: any) {
    console.error("Error adding ticket: ", error);
    throw new Error(error.message || "Failed to add ticket.");
  }
}

// Read (get all)
export async function getTickets() {
  try {
    const q = query(ticketsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as Ticket);
  } catch (error) {
    console.error("Error getting tickets: ", error);
    throw new Error("Failed to get tickets.");
  }
}

// Read (get one)
export async function getTicketById(id: string): Promise<Ticket | null> {
    try {
        const ticketDoc = doc(db, 'tickets', id);
        const docSnap = await getDoc(ticketDoc);
        if (docSnap.exists()) {
            return {id: docSnap.id, ...docSnap.data()} as Ticket;
        }
        return null;
    } catch (error) {
        console.error("Error getting ticket by ID: ", error);
        throw new Error("Failed to get ticket.");
    }
}

// Update
export async function updateTicket(id: string, updates: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>>) {
  try {
    const ticketDocRef = doc(db, 'tickets', id);
    
    const dataToUpdate: any = {
        ...updates,
        updatedAt: Timestamp.now()
    };
     if (updates.dueDate) {
        dataToUpdate.dueDate = new Date(updates.dueDate);
    }
    if (updates.status === 'closed' && !updates.closedAt) {
        dataToUpdate.closedAt = Timestamp.now();
    }
    await updateDoc(ticketDocRef, dataToUpdate);

    // Send notification for the update
    const ticketDoc = await getDoc(ticketDocRef);
    const ticket = ticketDoc.data() as Ticket;
    if(ticket.assignee) {
        const adminUsers = await getDocs(collection(db, 'admins')).then(snap => snap.docs.map(d => ({...d.data(), id: d.id} as AdminUser)));
        const allRoles = await getRoles();
        await createNotification(adminUsers, allRoles, {
            userId: ticket.assignee.id,
            title: `Ticket #${ticket.ticketNumber} Updated`,
            description: `Status changed to: ${updates.status?.replace('_', ' ')}.`,
            link: `/admin/support/${id}`,
            type: 'ticket_updated'
        });
    }

  } catch (error) {
    console.error("Error updating ticket: ", error);
    throw new Error("Failed to update ticket.");
  }
}

// Add a remark
export async function addTicketRemark(id: string, remark: Omit<TicketRemark, 'createdAt'>) {
  try {
    const ticketDoc = doc(db, 'tickets', id);
    await updateDoc(ticketDoc, {
      remarks: arrayUnion({
        ...remark,
        createdAt: Timestamp.now(),
      }),
      updatedAt: Timestamp.now(),
    });

    // Send notification for the new remark
    const updatedTicketDoc = await getDoc(ticketDoc);
    const ticket = updatedTicketDoc.data() as Ticket;
    if(ticket.assignee) {
        const adminUsers = await getDocs(collection(db, 'admins')).then(snap => snap.docs.map(d => ({...d.data(), id: d.id} as AdminUser)));
        const allRoles = await getRoles();
        await createNotification(adminUsers, allRoles, {
            userId: ticket.assignee.id,
            title: `New Remark on Ticket #${ticket.ticketNumber}`,
            description: `${remark.author} added a new comment.`,
            link: `/admin/support/${id}`,
            type: 'ticket_updated'
        });
    }

  } catch (error) {
    console.error("Error adding remark: ", error);
    throw new Error("Failed to add remark.");
  }
}

// Delete
export async function deleteTicket(id: string) {
  try {
    const ticketDoc = doc(db, 'tickets', id);
    await deleteDoc(ticketDoc);
  } catch (error) {
    console.error("Error deleting ticket: ", error);
    throw new Error("Failed to delete ticket.");
  }
}
