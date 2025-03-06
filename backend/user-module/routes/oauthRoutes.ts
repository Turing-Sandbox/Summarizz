import { Router } from "express";
import {
    verifyOAuthToken,
    generateOAuthUrl,
    handleOAuthCallback
} from "../services/oauthService";

const router = Router();

// Endpoint to verify OAuth tokens received from the client
router.post("/verify", verifyOAuthToken);

// Endpoint to generate OAuth URLs for different providers
router.post("/url", generateOAuthUrl);

// Callback endpoint for OAuth providers to redirect to after authorization
router.get("/callback/:provider", handleOAuthCallback);

export default router;