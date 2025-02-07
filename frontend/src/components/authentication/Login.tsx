"use client";

import { useState, useEffect } from "react";
import "../styles/authentication.scss";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebaseClientConfig";
import { OAuthButtons } from "./OAuthButtons";

function Login() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const authContext = useAuth();

  // If user is already logged in, redirect to homepage
  useEffect(() => {
    if (authContext.user) {
      router.push("/");
    }
  }, [authContext.user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${apiURL}/user/login`, user);
      if (res.status === 200 || res.status === 201) {
        const userUID = res.data.userUID;
        const token = res.data.token;

        // Sign in with Firebase
        await signInWithEmailAndPassword(auth, user.email, user.password);

        // Store token and UID
        authContext.login(token, userUID);

        router.push("/");
      } else {
        setError("An error occurred. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <div className='container'>
        <div className='auth-box'>
          <h1 className='summarizz-logo auth-title'>Summarizz</h1>
          <form onSubmit={handleSubmit}>
            <input
              type='email'
              value={user.email}
              onChange={handleChange}
              name='email'
              id='email'
              placeholder='Email'
              className='auth-input'
              required
            />
            <input
              type='password'
              value={user.password}
              onChange={handleChange}
              name='password'
              id='password'
              placeholder='Password'
              className='auth-input'
              required
            />

            {error && <p className='auth-error'>{error}</p>}

            <button type='submit' className='auth-button'>
              Login
            </button>

            {/* ------------------------- OAUTH ------------------------- */}
            <OAuthButtons />
          </form>

          {/* --------------------------------------------------------- */}
          {/* ------------------------- OAUTH ------------------------- */}
          {/* --------------------------------------------------------- */}

          {/* --------------------------------------------------------- */}
          {/* ------------------------- OAUTH ------------------------- */}
          {/* --------------------------------------------------------- */}
          <p>
            Don&apos;t have an account?{" "}
            <a href='/authentication/register'>Register</a>
            <br />
            Forgot your password? <a>Reset your password.</a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
