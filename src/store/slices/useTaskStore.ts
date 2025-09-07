
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/services/tasks';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  fetched: boolean;
  fetchTasks: (force?: boolean) => Promise<void>;
  forceRefresh: () => void;
}

const toSerializableTask = (docSnap: any): Task => {
    const data = docSnap.data();
    const dueDate = data.dueDate instanceof Timestamp ? data.dueDate.toDate().toISOString() : data.dueDate || null;
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
    const completedAt = data.completedAt instanceof Timestamp ? data.completedAt.toDate().toISOString() : data.completedAt || null;

    return {
        id: docSnap.id,
        ...data,
        dueDate,
        createdAt,
        completedAt,
    } as Task;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  fetched: false,
  fetchTasks: async (force = false) => {
    if (!force && get().fetched) return;
    set({ loading: true });
    try {
        const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const newTasks = snapshot.docs.map(toSerializableTask);
        set({ tasks: newTasks, loading: false, fetched: true });
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        set({ loading: false });
    }
  },
  forceRefresh: () => {
    set({ fetched: false });
    get().fetchTasks(true);
  }
}));
