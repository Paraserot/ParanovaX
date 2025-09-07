
"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export async function sendPasswordReset(email: string): Promise<void> {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        // We throw a generic error to avoid confirming if an email address exists or not.
        throw new Error("Could not process your password reset request.");
    }
}
