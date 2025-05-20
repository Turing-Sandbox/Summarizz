import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AuthenticationService } from "../../services/AuthenticationService";

function Callback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();

  useEffect(() => {
    const processCallbackData = async () => {
  
        const token = searchParams.get("token");
        const uid = searchParams.get("uid");
        const errorMsg = searchParams.get("error");

        if (errorMsg) {
          setError(decodeURIComponent(errorMsg));
          return;
        }

        if (!token || !uid) {
          setError("Invalid authentication data received");
          return;
        }

        // Verify token with backend
        const result = await AuthenticationService.handleCallbackResult(token);

        if (result instanceof Error) {
          setError(result.message || "Authentication failed");
          return;
        } 

        // Login and redirect
        auth.login(result.userUID);
        navigate("/");
     
    };

    processCallbackData();
  }, [auth, navigate, searchParams]);

  // If this is a popup callback, we need to send the data back to the opener window
  useEffect(() => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    if (window.opener) {
      const token = searchParams.get("token");
      const uid = searchParams.get("uid");
      const errorMsg = searchParams.get("error");

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

      // Close the popup
      window.close();
    }
  }, [searchParams]);

  return (
    <div className='auth-callback-container'>
      <div className='auth-callback-content'>
        <h1>Authentication in progress...</h1>
        {error ? (
          <div className='auth-callback-error'>
            <p>Authentication failed: {error}</p>
            <button onClick={() => navigate("/authentication/login")}>
              Back to Login
            </button>
          </div>
        ) : (
          <p>Please wait while we complete your authentication.</p>
        )}
      </div>
    </div>
  );
}

export default function CallbackAuthentication() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Callback />
    </Suspense>
  );
}
