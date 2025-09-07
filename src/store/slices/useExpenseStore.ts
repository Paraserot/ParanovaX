
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { Expense, toSerializableExpense } from '@/services/expenses';

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;
  fetched: boolean;
  fetchExpenses: (force?: boolean) => Promise<void>;
  forceRefresh: () => void;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  loading: false,
  fetched: false,
  fetchExpenses: async (force = false) => {
    if (!force && get().fetched) {
        return;
    }

    set({ loading: true });
    try {
        const q = query(collection(db, "expenses"), orderBy("expenseDate", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(toSerializableExpense);
        set({ expenses: data, loading: false, fetched: true });
    } catch(error) {
        console.error("Failed to fetch expenses:", error);
        set({ loading: false });
    }
  },
  forceRefresh: () => {
    set({ fetched: false });
    get().fetchExpenses(true);
  }
}));
