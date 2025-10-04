
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions/v2";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {startOfMonth, sub, isWithinInterval, endOfMonth} from "date-fns";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Global settings for functions
setGlobalOptions({maxInstances: 10, minInstances: 1});

// Type definitions for clarity
interface Client {
    id: string;
    clientType?: string;
    status: "active" | "inactive" | "pending";
    revenue?: number;
    createdAt?: admin.firestore.Timestamp | string;
}

interface Payment {
    id: string;
    status: "Completed" | "Pending" | "Failed";
    amount: number;
}

/**
 * Calculates the percentage change between two numbers.
 * @param {number} current The current value.
 * @param {number} previous The previous value.
 * @return {number} The percentage change.
 */
const getChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.1) {
    return 0;
  }
  return parseFloat(change.toFixed(0));
};

/**
 * A callable function to fetch aggregated dashboard statistics.
 */
export const getDashboardStats = onCall(async (request) => {
  if (!request.auth) {
    logger.error("Authentication check failed: User is not authenticated.");
    throw new Error(
      "The function must be called while authenticated.",
    );
  }

  const {clientTypeId} = request.data;
  if (clientTypeId) {
    logger.info(`Request for clientTypeId: ${clientTypeId}`);
  } else {
    logger.info("Request for all clients.");
  }

  try {
    const db = admin.firestore();
    const clientsRef = db.collection("clients");
    const paymentsRef = db.collection("payments");

    const [clientsSnapshot, paymentsSnapshot] = await Promise.all([
      clientsRef.get(),
      paymentsRef.where("status", "==", "Completed").get(),
    ]);

    const allClients: Client[] = clientsSnapshot.docs.map((doc) => (
      {id: doc.id, ...doc.data()} as Client
    ));

    const filteredClients = clientTypeId ?
      allClients.filter((c) => c.clientType === clientTypeId) :
      allClients;

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfPreviousMonth = startOfMonth(sub(now, {months: 1}));
    const endOfPreviousMonth = endOfMonth(sub(now, {months: 1}));

    let totalRevenue = 0;
    let activeClientsCount = 0;
    let inactiveClientsCount = 0;
    let pendingClientsCount = 0;
    let clientsAddedThisMonth = 0;
    let clientsAddedLastMonth = 0;
    let revenueThisMonth = 0;
    let revenueLastMonth = 0;

    filteredClients.forEach((client) => {
      totalRevenue += client.revenue || 0;
      if (client.status === "active") activeClientsCount++;
      else if (client.status === "inactive") inactiveClientsCount++;
      else if (client.status === "pending") pendingClientsCount++;

      const createdAtDate = client.createdAt ?
        (typeof client.createdAt === "string" ?
          new Date(client.createdAt) :
          client.createdAt.toDate()) :
        null;

      if (createdAtDate) {
        if (createdAtDate >= startOfCurrentMonth) {
          clientsAddedThisMonth++;
          revenueThisMonth += client.revenue || 0;
        }
        const interval = {start: startOfPreviousMonth, end: endOfPreviousMonth};
        if (isWithinInterval(createdAtDate, interval)) {
          clientsAddedLastMonth++;
          revenueLastMonth += client.revenue || 0;
        }
      }
    });

    const totalPayments = paymentsSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data() as Payment).amount, 0,
    );

    const stats = {
      totalRevenue: {
        value: totalRevenue,
        change: getChange(revenueThisMonth, revenueLastMonth),
      },
      totalClients: {
        value: filteredClients.length,
        change: getChange(clientsAddedThisMonth, clientsAddedLastMonth),
      },
      activeClients: {value: activeClientsCount, change: 0},
      inactiveClients: {value: inactiveClientsCount, change: 0},
      pendingClients: {value: pendingClientsCount, change: 0},
      totalPayments: {value: totalPayments, change: 0},
    };

    logger.info(`Stats for ${clientTypeId || "all"}.`, {stats});
    return stats;
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    throw new Error("An error occurred while fetching statistics.");
  }
});
