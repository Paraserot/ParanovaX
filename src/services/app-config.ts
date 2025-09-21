
"use client";

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { APP_VERSION } from '@/lib/app-version';

export type AppConfig = {
    latestVersion: string;
    companyName?: string;
    logoUrl?: string;
    faviconUrl?: string;
};

const configDocRef = doc(db, 'appConfig', 'main');

// Fetches the app config, seeds it if it doesn't exist
export async function getAppConfig(): Promise<AppConfig> {
  try {
    const docSnap = await getDoc(configDocRef);

    if (docSnap.exists()) {
      return docSnap.data() as AppConfig;
    } else {
      // If config doesn't exist, create it with the current app version
      console.log("App config not found, seeding with current version:", APP_VERSION);
      const initialConfig: AppConfig = {
        latestVersion: APP_VERSION,
        companyName: 'ParanovaX'
      };
      await setDoc(configDocRef, initialConfig);
      return initialConfig;
    }
  } catch (error) {
    console.error("Error getting app config: ", error);
    // Fallback to current version on error
    return { latestVersion: APP_VERSION };
  }
}

// Sets or updates the app config
export async function setAppConfig(config: Partial<AppConfig>): Promise<void> {
    try {
        await updateDoc(configDocRef, config);
    } catch (error) {
        // If the document doesn't exist, create it.
        if ((error as any).code === 'not-found') {
            await setDoc(configDocRef, config, { merge: true });
        } else {
            console.error("Error setting app config: ", error);
            throw new Error("Failed to set the app config.");
        }
    }
}
