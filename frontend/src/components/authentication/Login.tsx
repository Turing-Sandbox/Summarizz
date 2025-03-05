"use client";

import { useState, useEffect } from "react";
import "@/app/styles/authentication/authentication.scss";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import { OAuthButtons } from "./OAuthButtons";

function Login() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const auth = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1 - Reset Error Message
    setError("");

    // 2 - Login user
    await axios
        .post(`${apiURL}/user/login`, user)
        .then((res) => {
          if (res.status === 200 || res.status === 201) {
            const userUID = res.data.userUID;
            const token = res.data.token;

            // 3 - Set User Session (Save Token and User UID)
            auth.login(token, userUID);

            // Update user email
            axios.put(`${apiURL}/user/${userUID}`, {
              email: user.email,
            });

            // 4 - Redirect to home page
            router.push("/");

            // 5 - Error Handling
          } else {
            setError("An error occurred. Please try again.");
          }
        })
        .catch((error) => {
          if (
              error.response &&
              error.response.data &&
              error.response.data.error
          ) {
            setError(error.response.data.error);
          } else {
            setError("An error occurred. Please try again.");
          }
        });
  };

  // Authenticated users should not be able to access the login page
  if (auth.getUserUID() !== null && auth.getToken() !== null) {
    router.push("/");
  }

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

              <OAuthButtons />
            </form>

            <p>
              Don&apos;t have an account?{" "}
              <a href='/authentication/register'>Register</a>
              <br />
              Forgot your password?{" "}
              <a href='/authentication/reset-password'>Reset your password</a>
            </p>
          </div>
        </div>
      </>
  );
}

export default Login;