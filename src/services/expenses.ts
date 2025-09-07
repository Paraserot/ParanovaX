
"use client";

import { collection, getDocs, query, orderBy, Timestamp, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Expense = {
  id?: string;
  amount: number;
  category: string;
  description: string;
  expenseDate: string;
  paymentMethod: string;
  createdAt?: string;
};

const serializeTimestamp = (timestamp: any): string | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toISOString();
    }
    // If it's already a string (from a recent client-side creation), just return it.
    if (typeof timestamp === 'string') {
        return timestamp;
    }
    // Fallback for other potential date-like objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    return new Date().toISOString(); // Fallback
};

export const toSerializableExpense = (docSnap: any): Expense => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        expenseDate: serializeTimestamp(data.expenseDate) || new Date().toISOString(),
        createdAt: serializeTimestamp(data.createdAt) || new Date().toISOString(),
    } as Expense;
};

const expensesCollection = collection(db, 'expenses');

// Create
export async function addExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(expensesCollection, {
            ...expenseData,
            expenseDate: Timestamp.fromDate(new Date(expenseData.expenseDate)),
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding expense: ", error);
        throw new Error("Failed to add expense.");
    }
}

// Update
export async function updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) {
    try {
        const expenseDoc = doc(db, 'expenses', id);
        await updateDoc(expenseDoc, {
            ...updates,
            expenseDate: Timestamp.fromDate(new Date(updates.expenseDate!)),
        });
    } catch (error) {
        console.error("Error updating expense: ", error);
        throw new Error("Failed to update expense.");
    }
}

// Delete
export async function deleteExpense(id: string) {
    try {
        const expenseDoc = doc(db, 'expenses', id);
        await deleteDoc(expenseDoc);
    } catch (error) {
        console.error("Error deleting expense: ", error);
        throw new Error("Failed to delete expense.");
    }
}
