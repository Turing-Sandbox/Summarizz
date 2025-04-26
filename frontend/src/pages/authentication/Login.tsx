import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import axios from "axios";

import { apiURL } from "../../scripts/api";
import { OAuthButtons } from "../../components/authentication/OAuthButtons";

export default function Login() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
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
      .post(`${apiURL}/user/login`, user, { withCredentials: true })
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          // 3 - Set User Session (Save Token and User UID)
          auth.login(res.data.userUID);

          // // Update user email
          // axios.put(`${apiURL}/user/${userUID}`, {
          //   email: user.email,
          // });

          // 4 - Redirect to home page
          navigate("/");

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
  //   if (!auth.isAuthenticated) {
  //     navigate("/");
  //   }

  return (
    <>
      <div className='authentication'>
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
      </div>
    </>
  );
}
