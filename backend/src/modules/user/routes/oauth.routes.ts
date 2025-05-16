import { Router } from "express";
import {
    verifyOAuthToken,
    generateOAuthUrl,
    handleOAuthCallback
} from "../services/oauth.service";

const router = Router();

// Endpoint to verify OAuth tokens received from the client
router.post("/verify", verifyOAuthToken);

// Endpoint to generate OAuth URLs for different providers
router.post("/url", generateOAuthUrl);

// Direct routes for OAuth providers
router.get("/google", (req, res) => {
    req.body = { provider: 'google' };
    generateOAuthUrl(req, res);
});

router.get("/github", (req, res) => {
    req.body = { provider: 'github' };
    generateOAuthUrl(req, res);
});

// Callback endpoint for OAuth providers to redirect to after authorization
router.get("/callback/:provider", handleOAuthCallback);

export default router;