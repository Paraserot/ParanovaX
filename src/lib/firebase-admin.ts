
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

const serviceAccount = {
  "type": "service_account",
  "project_id": "advocate-case-manager",
  "private_key_id": "242993ecccef917ab918345f2dd9ce79a41c6442",
  // IMPORTANT: The private key is now loaded from an environment variable for security
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-fbsvc@advocate-case-manager.iam.gserviceaccount.com",
  "client_id": "102697810374341181782",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40advocate-case-manager.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

let adminDb: App | null = null;

if (!serviceAccount.private_key) {
  console.error("FATAL ERROR: FIREBASE_PRIVATE_KEY environment variable is not set.");
} else {
    if (!getApps().length) {
        adminDb = initializeApp({
          credential: cert(serviceAccount as any),
        });
    } else {
        adminDb = getApps()[0];
    }
}


export { adminDb };
