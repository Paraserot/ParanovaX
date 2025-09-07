
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Expense, toSerializableExpense } from '@/services/expenses';

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;
  fetched: boolean;
  fetchExpenses: (force?: boolean) => () => void;
  forceRefresh: () => void;
}

let unsubscribe: (() => void) | null = null;

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  loading: false,
  fetched: false,
  fetchExpenses: (force = false) => {
    if (!force && (get().fetched || get().loading)) {
      return unsubscribe || (() => {});
    }

    set({ loading: true });

    const q = query(collection(db, "expenses"), orderBy("expenseDate", "desc"));
    
    unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(toSerializableExpense);
      set({ expenses: data, loading: false, fetched: true });
    }, (error) => {
      console.error("Failed to subscribe to expense updates:", error);
      set({ loading: false });
    });

    return unsubscribe;
  },
  forceRefresh: () => {
    get().fetchExpenses(true);
  }
}));

    
