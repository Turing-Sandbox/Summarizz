"use client";

import Background from "@/components/Background";
import Footer from "@/components/Footer";
import AuthProvider from "@/hooks/AuthProvider";
import ResetPasswordConfirm from "@/components/authentication/ResetPasswordConfirm";
import "@/app/styles/authentication/authentication.scss";

export default function ResetPasswordConfirmPage() {
    return (
        <>
            <Background />
            <AuthProvider>
                <div className="authentication">
                    <ResetPasswordConfirm />
                </div>
                <div className="footer">
                    <Footer />
                </div>
            </AuthProvider>
        </>
    );
}