"use client";

import Background from "@/components/Background";
import Footer from "@/components/Footer";
import AuthProvider from "@/hooks/AuthProvider";
import PasswordReset from "@/components/authentication/PasswordReset";
import "@/app/styles/authentication/authentication.scss";

export default function ResetPasswordPage() {
    return (
        <>
            <Background />
            <AuthProvider>
                <div className="authentication">
                    <PasswordReset />
                </div>
                <div className="footer">
                    <Footer />
                </div>
            </AuthProvider>
        </>
    );
}