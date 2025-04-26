import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { apiURL } from "../../scripts/api";
import { OAuthButtons } from "../../components/authentication/OAuthButtons";

export default function Register() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const auth = useAuth();

  // Check if passwords match
  useEffect(() => {
    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  }, [user.password, user.confirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1 - Reset Error Message
    setError("");

    // 2 - Validate user input
    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 3 - Register user
    axios
      .post(`${apiURL}/user/register`, user, { withCredentials: true })
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          // 3 - Set User Session (Save Token and User UID)
          auth.login(res.data.userUID);

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

  // Redirect to home page if user is already logged in
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

              <OAuthButtons />
            </form>

            <p>
              Already have an account? <a href='/authentication/login'>Login</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
