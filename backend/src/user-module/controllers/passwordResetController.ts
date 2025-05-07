import { Request, Response } from "express";
import { sendPasswordResetEmail_Firebase } from "../services/passwordResetService";
import { getLoggerWithContext } from "../../shared/loggingHandler";

const logger = getLoggerWithContext("PasswordResetController");

/**
 * Controller for handling password reset requests, 
 * this directly uses Firebase's password reset 
 * functionality.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export async function requestPasswordResetController(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // We'll always return the same response regardless of whether the email exists
        // to prevent email enumeration attacks
        await sendPasswordResetEmail_Firebase(email);

        res.status(200).json({
            message: "An email was sent if it matches an existing account, follow the instructions provided in the email."
        });
    } catch (error) {
        logger.error("Error requesting password reset:", error);

        // For security, we still return a success message even if something went wrong
        res.status(200).json({
            message: "An email was sent if it matches an existing account, follow the instructions provided in the email."
        });
    }
}