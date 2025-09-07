
'use client';

import { collection, doc, getDocs, updateDoc, query, where, getCountFromServer, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Testimonial = {
  id?: string;
  name: string;
  phone: string;
  rating: number;
  feedback: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
};

export type TestimonialStats = {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    averageRating: number;
};

const testimonialsCollection = collection(db, 'testimonials');

// Update testimonial status
export async function updateTestimonialStatus(id: string, status: 'Approved' | 'Rejected'): Promise<void> {
  try {
    const testimonialDoc = doc(db, 'testimonials', id);
    await updateDoc(testimonialDoc, { status });
  } catch (error) {
    console.error("Error updating testimonial status: ", error);
    throw new Error("Failed to update testimonial status.");
  }
}

// Get testimonial stats
export async function getTestimonialStats(): Promise<TestimonialStats> {
    try {
        const totalPromise = getCountFromServer(testimonialsCollection);
        const approvedPromise = getCountFromServer(query(testimonialsCollection, where('status', '==', 'Approved')));
        const pendingPromise = getCountFromServer(query(testimonialsCollection, where('status', '==', 'Pending')));
        const rejectedPromise = getCountFromServer(query(testimonialsCollection, where('status', '==', 'Rejected')));
        const allDocsPromise = getDocs(testimonialsCollection);

        const [totalSnapshot, approvedSnapshot, pendingSnapshot, rejectedSnapshot, allDocsSnapshot] = await Promise.all([
            totalPromise,
            approvedPromise,
            pendingPromise,
            rejectedPromise,
            allDocsPromise
        ]);

        let totalRating = 0;
        let ratedCount = 0;
        allDocsSnapshot.forEach(doc => {
            const rating = doc.data().rating;
            if (typeof rating === 'number') {
                totalRating += rating;
                ratedCount++;
            }
        });

        const averageRating = ratedCount > 0 ? totalRating / ratedCount : 0;

        return {
            total: totalSnapshot.data().count,
            approved: approvedSnapshot.data().count,
            pending: pendingSnapshot.data().count,
            rejected: rejectedSnapshot.data().count,
            averageRating: averageRating
        };
    } catch (error) {
        console.error("Error getting testimonial stats: ", error);
        throw new Error("Failed to get testimonial stats.");
  }
}
