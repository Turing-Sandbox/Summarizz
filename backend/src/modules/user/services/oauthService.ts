import { adminAuth } from "../../../shared/firebaseAdminConfig";
import { db } from "../../../shared/config/firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../../shared/config/environment";
import axios from "axios";
import { getAuth, signInWithCredential, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

/**
 * Handle OAuth verification from providers
 * This function verifies the OAuth token from the provider
 * and creates a user account if it doesn't exist
 */
export async function verifyOAuthToken(req: Request, res: Response) {
    try {
        const { idToken, provider } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "No ID token provided" });
        }

        let uid, email, name, picture;

        // For Google tokens, verify directly with Google instead of Firebase
        if (provider === 'google') {
            try {
                // Verify the token with Google
                const response = await axios.get(
                    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
                );

                // Extract user info from the verification response
                const tokenInfo = response.data;
                uid = tokenInfo.sub;
                email = tokenInfo.email;
                name = tokenInfo.name;
                picture = tokenInfo.picture;

                // Additional check to verify the audience matches our client ID
                if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
                    return res.status(401).json({
                        error: "Token was not issued for this application"
                    });
                }
            } catch (error) {
                console.error("Google token verification error:", error);
                return res.status(401).json({
                    error: "Failed to verify Google token"
                });
            }
        } else {
            // For other providers or if needed later, you can add similar verification
            try {
                // Fallback to Firebase verification for other providers
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                uid = decodedToken.uid;
                email = decodedToken.email;
                name = decodedToken.name;
                picture = decodedToken.picture;
            } catch (error) {
                console.error("Firebase token verification error:", error);
                return res.status(401).json({
                    error: "Failed to verify token"
                });
            }
        }

        // Check if user exists in Firestore
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);

        // If user doesn't exist, create a new user document
        if (!userDoc.exists()) {
            const nameParts = name ? name.split(' ') : ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            const username = email ? email.split('@')[0] : `user_${Date.now()}`;

            const newUser = {
                uid,
                firstName,
                lastName,
                username,
                email: email || '',
                profileImage: picture || undefined,
                createdAt: new Date(),
                authProvider: provider
            };

            await setDoc(userRef, newUser);
        }

        // Generate JWT token for the client
        const token = jwt.sign({ uid }, env.jwt.secret, {
            expiresIn: env.jwt.expiresIn
        });

        return res.status(200).json({
            userUID: uid,
            token
        });

    } catch (error: any) {
        console.error("OAuth verification error:", error);
        return res.status(401).json({
            error: error.message || "Authentication failed"
        });
    }
}

/**
 * Generate OAuth URL for specific providers
 * Returns the URL where the user should be redirected to initiate OAuth flow
 */
export async function generateOAuthUrl(req: Request, res: Response) {
    try {
        const { provider, redirectUri } = req.body;

        // This would typically use Firebase Admin SDK to generate OAuth URLs
        // For demonstration, we're returning placeholder URLs
        let authUrl: string;
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

        switch (provider) {
            case 'google':
                authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${
                    process.env.GOOGLE_CLIENT_ID
                }&redirect_uri=${encodeURIComponent(
                    `${backendUrl}/oauth/callback/google`
                )}&scope=email%20profile&response_type=code`;
                break;

            case 'github':
                authUrl = `https://github.com/login/oauth/authorize?client_id=${
                    process.env.GITHUB_CLIENT_ID
                }&redirect_uri=${encodeURIComponent(
                    `${backendUrl}/oauth/callback/github`
                )}&scope=user:email&response_type=code`;
                break;

            default:
                return res.status(400).json({ error: "Unsupported provider" });
        }

        return res.status(200).json({ authUrl });

    } catch (error: any) {
        console.error("Generate OAuth URL error:", error);
        return res.status(500).json({ error: error.message || "Failed to generate OAuth URL" });
    }
}

/**
 * Exchange Google authorization code for Firebase token
 */
async function exchangeGoogleCodeForToken(code: string, redirectUri: string) {
    try {
        // Step 1: Exchange authorization code for access and ID tokens
        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }
        );

        const { id_token, access_token } = tokenResponse.data;

        // Step 2: Use the ID token to sign in with Firebase
        const auth = getAuth();
        const credential = GoogleAuthProvider.credential(id_token, access_token);
        const userCredential = await signInWithCredential(auth, credential);

        // Return user info
        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL
        };
    } catch (error: any) {
        console.error("Error exchanging Google code for token:", error);
        throw new Error(error.message || "Failed to authenticate with Google");
    }
}

/**
 * Exchange GitHub authorization code for Firebase token
 */
async function exchangeGithubCodeForToken(code: string, redirectUri: string) {
    try {
        // Step 1: Exchange authorization code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: redirectUri
            },
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        const { access_token } = tokenResponse.data;

        // Step 2: Get user info from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${access_token}`
            }
        });

        // Step 3: Create GitHub credential and sign in
        const auth = getAuth();
        const credential = GithubAuthProvider.credential(access_token);
        const userCredential = await signInWithCredential(auth, credential);

        // Return user info
        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || userResponse.data.name,
            photoURL: userCredential.user.photoURL || userResponse.data.avatar_url
        };
    } catch (error: any) {
        console.error("Error exchanging GitHub code for token:", error);
        throw new Error(error.message || "Failed to authenticate with GitHub");
    }
}

/**
 * Handle OAuth callback from providers
 * This endpoint is called by the OAuth provider after user authorization
 */
export async function handleOAuthCallback(req: Request, res: Response) {
    try {
        const provider = req.params.provider;
        const { code } = req.query;
        const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:3000'}/oauth/callback/${provider}`;

        // Exchange authorization code for tokens
        let userData: any;
        switch (provider) {
            case 'google':
                // Exchange code for token with Google
                userData = await exchangeGoogleCodeForToken(code as string, redirectUri);
                break;

            case 'github':
                // Exchange code for token with GitHub
                userData = await exchangeGithubCodeForToken(code as string, redirectUri);
                break;

            default:
                return res.status(400).json({ error: "Unsupported provider" });
        }

        // Check if user exists in Firestore and create if not
        const userRef = doc(db, "users", userData.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Create new user
            const nameParts = userData.displayName ? userData.displayName.split(' ') : ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            const username = userData.email ? userData.email.split('@')[0] : `user_${Date.now()}`;

            const newUser = {
                uid: userData.uid,
                firstName,
                lastName,
                username,
                email: userData.email || '',
                profileImage: userData.photoURL || undefined,
                createdAt: new Date(),
                authProvider: provider
            };

            await setDoc(userRef, newUser);
        }

        // Generate JWT token for the client
        const token = jwt.sign({ uid: userData.uid }, env.jwt.secret, {
            expiresIn: env.jwt.expiresIn
        });

        // Redirect to frontend with token
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?token=${token}&uid=${userData.uid}`;
        return res.redirect(redirectUrl);
    } catch (error: any) {
        console.error("OAuth callback error:", error);
        const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/error?message=${encodeURIComponent(error.message)}`;
        return res.redirect(errorUrl);
    }
}