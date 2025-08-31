
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Ticket } from '@/services/tickets';

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  fetchTickets: (force?: boolean) => () => void;
  forceRefresh: () => void;
}

const toSerializableTicket = (docSnap: any): Ticket => {
    const data = docSnap.data();
    const remarks = (data.remarks || []).map((r: any) => ({
        ...r,
        createdAt: (r.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    }));

    return {
        id: docSnap.id,
        ...data,
        remarks,
        dueDate: (data.dueDate as Timestamp)?.toDate().toISOString() || null,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        closedAt: (data.closedAt as Timestamp)?.toDate().toISOString() || null,
    } as Ticket;
};

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  loading: false,
  fetchTickets: (force = false) => {
    if (!force && get().tickets.length > 0) return () => {};
    set({ loading: true });
    const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTickets = snapshot.docs.map(toSerializableTicket);
      set({ tickets: newTickets, loading: false });
    }, (error) => {
      console.error("Failed to fetch tickets:", error);
      set({ loading: false });
    });

    return unsubscribe;
  },
  forceRefresh: () => {
    get().fetchTickets(true);
  }
}));

    