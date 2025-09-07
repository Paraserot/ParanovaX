
import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { config as loadEnv } from "dotenv";
loadEnv();

const serviceAccount = {
  type: "service_account",
  project_id: "advocate-case-manager",
  private_key_id: "242993ecccef917ab918345f2dd9ce79a41c6442",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email:
    "firebase-adminsdk-fbsvc@advocate-case-manager.iam.gserviceaccount.com",
};

if (!serviceAccount.private_key) {
  throw new Error("FIREBASE_PRIVATE_KEY missing in .env (with \\n newlines).");
}

export const adminDb: App =
  getApps().length ? (getApps()[0] as App) : initializeApp({ credential: cert(serviceAccount as any) });
