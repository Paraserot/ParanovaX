
"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadImage(file: File, path: string) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { downloadURL, error: null };
  } catch (error: any) {
    console.error("Upload failed:", error);
    return { downloadURL: null, error: error.message || "Upload failed." };
  }
}
