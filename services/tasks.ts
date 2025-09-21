
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export type Task = {
  id?: string;
  title: string;
  description?: string;
  assignedTo: string; // employeeId
  clientId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'upcoming' | 'ongoing' | 'completed';
  taskType?: 'visit' | 'call' | 'follow-up';
  dueDate?: string | null;
  createdAt?: string;
  completedAt?: string | null;
};

const tasksCollection = collection(db, 'tasks');

// Create
export async function addTask(taskData: Omit<Task, 'id' | 'createdAt'>) {
  try {
    const dataToSave: any = { ...taskData, createdAt: Timestamp.now() };
    if (taskData.dueDate) {
        dataToSave.dueDate = new Date(taskData.dueDate);
    } else {
        dataToSave.dueDate = null;
    }
    if (taskData.status === 'completed' && !taskData.completedAt) {
        dataToSave.completedAt = Timestamp.now();
    } else {
        dataToSave.completedAt = null;
    }

    const docRef = await addDoc(tasksCollection, dataToSave);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Failed to add task.");
  }
}

// Update
export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  try {
    const taskDoc = doc(db, 'tasks', id);
    const dataToUpdate: any = { ...updates };
    if (updates.dueDate) {
      dataToUpdate.dueDate = new Date(updates.dueDate);
    }
    if (updates.status === 'completed' && !updates.completedAt) {
        dataToUpdate.completedAt = Timestamp.now();
    } else if (updates.status !== 'completed') {
        dataToUpdate.completedAt = null;
    }
    
    await updateDoc(taskDoc, dataToUpdate);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw new Error("Failed to update task.");
  }
}

// Delete
export async function deleteTask(id: string) {
  try {
    const taskDoc = doc(db, 'tasks', id);
    await deleteDoc(taskDoc);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw new Error("Failed to delete task.");
  }
}
