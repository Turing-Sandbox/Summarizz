import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * This page is specifically designed to handle OAuth popup callbacks.
 * It receives OAuth tokens from the authentication provider and sends
 * them to the parent window that opened this popup.
 */
function PopupCallbackContent() {
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    try {
      const token = searchParams.get("token");
      const uid = searchParams.get("uid");
      const errorMsg = searchParams.get("error");

      // Only proceed if we're in the browser environment
      if (typeof window === "undefined") return;

      // Verify window.opener exists
      if (!window.opener) {
        setError("Authentication window was not opened correctly");
        return;
      }

      // Send message to parent window
      if (errorMsg) {
        window.opener.postMessage(
          { error: decodeURIComponent(errorMsg) },
          window.location.origin
        );
      } else if (token && uid) {
        window.opener.postMessage({ token, uid }, window.location.origin);
      } else {
        window.opener.postMessage(
          { error: "Invalid authentication data received" },
          window.location.origin
        );
      }

      // Close the popup after sending the message
      window.close();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to process authentication"
      );
    }
  }, [searchParams]);

  return (
    <div className='popup-callback-container'>
      <h1>Authentication Complete</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <p>Authentication successful! You can close this window.</p>
      )}
    </div>
  );
}

export default function PopupCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PopupCallbackContent />
    </Suspense>
  );
}
