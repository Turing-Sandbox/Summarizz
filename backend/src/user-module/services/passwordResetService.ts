import { auth } from "../../shared/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

/**
 * Sends a password reset email using Firebase Authentication
 * @param email - User's email address
 * @returns Promise<void>
 */
export async function sendPasswordResetEmail_Firebase(email: string): Promise<void> {
    try {
        // Set up custom redirect URL for your app after password reset
        const actionCodeSettings = {
            url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/authentication/login`,
            handleCodeInApp: false
        };

        // Send password reset email using Firebase Auth
        await sendPasswordResetEmail(auth, email, actionCodeSettings);

        // We don't need to return anything, Firebase handles the rest
    } catch (error) {
        console.error("Error sending password reset email:", error);
        // We intentionally don't throw here to prevent email enumeration
    }
}