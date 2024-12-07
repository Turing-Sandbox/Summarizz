"use client";

import { useEffect, useState } from "react";
import "../styles/authentication.scss";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebaseClientConfig";

function Register() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();
  const authContext = useAuth();

  useEffect(() => {
    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  }, [user.password, user.confirmPassword]);

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

    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${apiURL}/user/register`, user);
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
          <h1 className='auth-title summarizz-logo'>Summarizz</h1>
          <form className='auth-form' onSubmit={handleSubmit}>
            <input
              type='text'
              value={user.firstName}
              onChange={handleChange}
              name='firstName'
              placeholder='First Name'
              className='auth-input'
              required
            />
            <input
              type='text'
              value={user.lastName}
              onChange={handleChange}
              name='lastName'
              placeholder='Last Name'
              className='auth-input'
              required
            />
            <input
              type='text'
              value={user.username}
              onChange={handleChange}
              name='username'
              placeholder='Username'
              className='auth-input'
              required
            />
            <input
              type='email'
              value={user.email}
              onChange={handleChange}
              name='email'
              placeholder='Email'
              className='auth-input'
              required
            />
            <input
              type='password'
              value={user.password}
              onChange={handleChange}
              name='password'
              placeholder='Password'
              className='auth-input'
              required
            />
            <input
              type='password'
              value={user.confirmPassword}
              onChange={handleChange}
              name='confirmPassword'
              placeholder='Confirm Password'
              className='auth-input'
              required
            />

            {error && <p className='auth-error'>{error}</p>}

            <button type='submit' className='auth-button'>
              Register
            </button>
          </form>

          <a href='/authentication/login' className='auth-link'>
            <p>
              Already have an account? <b>Login</b>
            </p>
          </a>
        </div>
      </div>
    </>
  );
}

export default Register;
