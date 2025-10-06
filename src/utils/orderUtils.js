import { db } from '../firebase'; 
import { collection, query, where, getDocs, orderBy, doc, getDoc, Timestamp } from "firebase/firestore";

// --- HELPER FUNCTION ---
/**
 * Formats a Firestore Timestamp, Date object, or date string into a readable date string.
 * @param {Timestamp | Date | string | number} dateInput 
 * @returns {string} Formatted date string or 'N/A'
 */
export const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    let date;
    if (dateInput instanceof Timestamp || dateInput.toDate) {
        date = dateInput.toDate();
    } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else {
        return 'N/A';
    }
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    // Using UTC date format for consistency, adjust locale as needed
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

// --- FIREBASE API CALL IMPLEMENTATION (Fetch All) ---
/**
 * Fetches all orders for a specific user, sorted by creation date descending.
 * @param {string} userId - The unique ID of the current user.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of order objects.
 */
export const fetchUserOrders = async (userId) => {
    if (!userId || !db) return [];
    
    console.log(`Fetching orders for user: ${userId}`);

    try {
        const ordersRef = collection(db, "orders");
        // Fetch ALL orders, sorted by creation date (newest first)
        const userOrdersQuery = query(
            ordersRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc") 
        );

        const snapshot = await getDocs(userOrdersQuery);
        
        const ordersList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`Fetched ${ordersList.length} orders.`);
        return ordersList;

    } catch (error) {
        console.error("Error fetching user orders from Firestore:", error);
        // Throwing error for component to catch
        throw new Error("Failed to communicate with the database."); 
    }
}

// --- FIREBASE API CALL IMPLEMENTATION (Fetch Single) ---
/**
 * Fetches a single order document by its ID.
 * @param {string} orderId - The document ID of the order.
 * @returns {Promise<Object | null>} A promise that resolves to the order object or null if not found.
 */
export const fetchOrderById = async (orderId) => {
    if (!orderId || !db) return null;

    try {
        // Assume 'db' is correctly initialized elsewhere (like in firebase.js)
        const orderDocRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(orderDocRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            console.log(`No order found with ID: ${orderId}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        throw new Error("Failed to retrieve order details from the database.");
    }
};
