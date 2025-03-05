"use client";

import { useState, useEffect } from "react";
import "@/app/styles/authentication/authentication.scss";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { apiURL } from "@/app/scripts/api";

function ResetPasswordConfirm() {
    const [passwords, setPasswords] = useState({
        password: "",
        confirmPassword: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token");

    useEffect(() => {
        // Verify token validity
        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await axios.post(`${apiURL}/user/verify-reset-token`, { token });
                if (response.status === 200) {
                    setIsValidToken(true);
                }
            } catch (error) {
                setError("This password reset link is invalid or has expired");
                console.error("Token verification error:", error);
            }
        };

        verifyToken();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });

        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        // Validate passwords
        if (passwords.password !== passwords.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (passwords.password.length < 8) {
            setError("Password must be at least 8 characters long");
            setIsLoading(false);
            return;
        }

        try {
            await axios.post(`${apiURL}/user/reset-password`, {
                token,
                newPassword: passwords.password,
            });

            setMessage("Password has been reset successfully. You can now login with your new password.");

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                router.push("/authentication/login");
            }, 3000);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                "Failed to reset password. The link may have expired.";
            setError(errorMessage);
            console.error("Password reset error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isValidToken && error) {
        return (
            <div className="container">
                <div className="auth-box">
                    <h1 className="summarizz-logo auth-title">Summarizz</h1>
                    <div className="auth-error-container">
                        <p className="auth-error">{error}</p>
                        <button
                            onClick={() => router.push("/authentication/login")}
                            className="auth-button"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container">
                <div className="auth-box">
                    <h1 className="summarizz-logo auth-title">Summarizz</h1>
                    <h2>Set New Password</h2>
                    <p>Please enter your new password below.</p>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="password"
                            value={passwords.password}
                            onChange={handleChange}
                            name="password"
                            placeholder="New Password"
                            className="auth-input"
                            required
                            minLength={8}
                        />

                        <input
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            className="auth-input"
                            required
                        />

                        {error && <p className="auth-error">{error}</p>}
                        {message && <p className="auth-success">{message}</p>}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPasswordConfirm;