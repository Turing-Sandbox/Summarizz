/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import "../styles/authentication.scss";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";

function Login() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const auth = useAuth();

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1 - Reset Error Message
    setError("");

    // 2 - Login user
    axios
      .post(`${apiURL}/user/login`, user)
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          const userUID = res.data.userUID;
          const token = res.data.token;

          // 3 - Set User Session (Save Token and User UID)
          auth.login(token, userUID);

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

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <div className='container'>
        <div className='auth-box'>
          <h1 className='auth-title summarizz-logo'>Summarizz</h1>

          <form className='auth-form' onSubmit={handleSubmit}>
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
          </form>

          {/* --------------------------------------------------------- */}
          {/* ------------------------- OAUTH ------------------------- */}
          {/* --------------------------------------------------------- */}


          {/* --------------------------------------------------------- */}
          {/* ------------------------- OAUTH ------------------------- */}
          {/* --------------------------------------------------------- */}

          <a href='/authentication/register' className='auth-link'>
            <p>
              Don&apos;t have an account? <b>Register</b>
            </p>
          </a>
        </div>
      </div>
    </>
  );
}

export default Login;
