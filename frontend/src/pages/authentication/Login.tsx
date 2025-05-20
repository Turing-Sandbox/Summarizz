import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { OAuthButtons } from "../../components/authentication/OAuthButtons";
import { AuthenticationService } from "../../services/AuthenticationService";

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
    const response = await AuthenticationService.login(
      user.email,
      user.password
    );

    // 3 - Check if response is an error
    if (response instanceof Error) {
      setError(response.message || "An error occurred. Please try again.");
      return;
    }

    // 4 - Check if the user is logged in
    if (response.userUID) {
      // 5 - Set User Session (Save Token and User UID)
      auth.login(response.userUID);
      // 6 - Redirect to home page
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
                type='email'
                value={user.email}
                onChange={handleChange}
                name='email'
                id='email'
                placeholder='Email'
                className='auth-input'
              />
              <input
                type='password'
                value={user.password}
                onChange={handleChange}
                name='password'
                id='password'
                placeholder='Password'
                className='auth-input'
              />

              {error && <p className='auth-error'>{error}</p>}

              <button type='submit' className='auth-button'>
                Login
              </button>
            </form>

            <div className='oauth-container'>
              <p className='oauth-separator'>OR</p>
              <OAuthButtons />
            </div>

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
