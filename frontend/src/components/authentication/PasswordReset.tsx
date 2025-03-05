"use client";

import { useState } from "react";
import "@/app/styles/authentication/authentication.scss";
import axios from "axios";
import { useRouter } from "next/navigation";
import { apiURL } from "@/app/scripts/api";

function PasswordReset() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            await axios.post(`${apiURL}/user/reset-password-request`, { email });
            setMessage("An email was sent if it matches an existing account. Follow the instructions provided in the email.");
        } catch (error) {
            // Display the same message even if there's an error to prevent email enumeration
            setMessage("An email was sent if it matches an existing account. Follow the instructions provided in the email.");
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
                        />

                        {message && <p className="auth-message">{message}</p>}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Reset Password"}
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