"use client";

import { useState, useEffect } from "react";
import "@/app/styles/authentication/authentication.scss";
import axios from "axios";
import { useRouter } from "next/navigation";
import { apiURL } from "@/app/scripts/api";

function PasswordReset() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const router = useRouter();

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isButtonDisabled && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (countdown === 0) {
            setIsButtonDisabled(false);
            setCountdown(60);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isButtonDisabled, countdown]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            await axios.post(`${apiURL}/user/reset-password-request`, { email });
            setMessage("✓ Reset link sent! Please check your email inbox (and spam folder) for instructions.");
            setIsButtonDisabled(true);
        } catch (error) {
            // Display the same message even if there's an error to prevent email enumeration
            setMessage("✓ Reset link sent! Please check your email inbox (and spam folder) for instructions.");
            setIsButtonDisabled(true);
            console.error("Error requesting password reset:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="container">
                <div className="auth-box">
                    <h1 className="summarizz-logo auth-title">Summarizz</h1>
                    <h2>Reset Password</h2>
                    <p>Enter your email address and we'll send you instructions to reset your password.</p>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            value={email}
                            onChange={handleChange}
                            name="email"
                            id="email"
                            placeholder="Email"
                            className="auth-input"
                            required
                            disabled={isButtonDisabled}
                        />

                        {message && <p className="auth-message auth-success">{message}</p>}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading || isButtonDisabled}
                        >
                            {isLoading ? "Sending..." : isButtonDisabled ? `Try again in ${countdown}s` : "Reset Password"}
                        </button>
                    </form>

                    <p>
                        Remember your password? <a href="/authentication/login">Login</a>
                    </p>
                </div>
            </div>
        </>
    );
}

export default PasswordReset;