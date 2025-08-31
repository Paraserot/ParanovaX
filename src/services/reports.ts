
"use client";

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DateRange } from "react-day-picker";

type LoginActivityParams = {
    dateRange: DateRange;
    userType: 'all' | 'client' | 'admin';
};

export async function getLoginActivityReport({ dateRange, userType }: LoginActivityParams) {
    let q = query(collection(db, "login_activity"));
    
    if (dateRange.from) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(dateRange.from)));
    }
    if (dateRange.to) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(dateRange.to)));
    }
    if (userType !== 'all') {
        q = query(q, where('userType', '==', userType));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp.toDate().toISOString(),
        }
    });
}
