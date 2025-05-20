import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { OAuthButtons } from "../../components/authentication/OAuthButtons";
import UserService from "../../services/UserService";
import { AuthenticationService } from "../../services/AuthenticationService";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1 - Reset Error Message
    setError("");

    // 2 - Validate user input
    const validationFeedback = await UserService.validatePassword(
      "",
      user.password,
      user.confirmPassword,
      false
    );

    if (validationFeedback) {
      setError(validationFeedback);
      return;
    }

    // 3 - Register user
    const response = await AuthenticationService.register(
      user.firstName,
      user.lastName,
      user.username,
      user.email,
      user.password
    );

    // 4 - Check if response is an error
    if (response instanceof Error) {
      setError(response.message || "An error occurred. Please try again.");
      return;
    }

    // 5 - Check if the user is logged in
    if (response.userUID) {
      // 6 - Set User Session (Save Token and User UID)
      auth.login(response.userUID);
      // 7 - Redirect to home page
      navigate("/");
    } else {
      setError("An error occurred. Please try again.");
    }
  };

  // Redirect to home page if user is already logged in
  if (auth.isAuthenticated) {
    navigate("/");
  }

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
              />
              <input
                type='text'
                value={user.lastName}
                onChange={handleChange}
                name='lastName'
                placeholder='Last Name'
                className='auth-input'
              />
              <input
                type='text'
                value={user.username}
                onChange={handleChange}
                name='username'
                placeholder='Username'
                className='auth-input'
              />
              <input
                type='email'
                value={user.email}
                onChange={handleChange}
                name='email'
                placeholder='Email'
                className='auth-input'
              />
              <input
                type='password'
                value={user.password}
                onChange={handleChange}
                name='password'
                placeholder='Password'
                className='auth-input'
              />
              <input
                type='password'
                value={user.confirmPassword}
                onChange={handleChange}
                name='confirmPassword'
                placeholder='Confirm Password'
                className='auth-input'
              />

              {error && <p className='auth-error'>{error}</p>}

              <button type='submit' className='auth-button'>
                Register
              </button>
            </form>

            <div className='oauth-container'>
              <p className='oauth-separator'>OR</p>
              <OAuthButtons />
            </div>

            <p>
              Already have an account? <a href='/authentication/login'>Login</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
