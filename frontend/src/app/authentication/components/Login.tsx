/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import "../styles/authentication.scss";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthProvider";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset Error Message
    setError("");

    // login user
    axios
      .post("http://localhost:3000/user/login", user)
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          const userUID = res.data.userUID;
          const token = res.data.token;

          // Login user
          auth.login(token, userUID);

          // Redirect to home page
          router.push("/");
        } else {
          console.log(res.data);
          // Display error message
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

  console.log("auth.getUserUID: ", auth.getUserUID());
  console.log("auth.getToken: ", auth.getToken());

  if (auth.getUserUID() !== null && auth.getToken() !== null) {
    console.log("UserUID", auth.getUserUID());
    console.log("Token", auth.getToken());
    console.log("Redirecting to home page...");
    router.push("/");
  }

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

          {/* ------------------------- OAUTH ------------------------- */}
          {/* <div className='auth-oauth-section'>
          <button className='auth-button auth-oauth-button left'>
            <img src='/images/google.svg' alt='Google' className='logo' />
          </button>
          <button className='auth-button auth-oauth-button'>
            <svg
              className='logo'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 256 315'
            >
              <path d='M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615c-.35 1.116-6.599 22.563-21.757 44.716c-13.104 19.153-26.705 38.235-48.13 38.63c-21.05.388-27.82-12.483-51.888-12.483c-24.061 0-31.582 12.088-51.51 12.871c-20.68.783-36.428-20.71-49.64-39.793c-27-39.033-47.633-110.3-19.928-158.406c13.763-23.89 38.36-39.017 65.056-39.405c20.307-.387 39.475 13.662 51.889 13.662c12.406 0 35.699-16.895 60.186-14.414c10.25.427 39.026 4.14 57.503 31.186c-1.49.923-34.335 20.044-33.978 59.822M174.24 50.199c10.98-13.29 18.369-31.79 16.353-50.199c-15.826.636-34.962 10.546-46.314 23.828c-10.173 11.763-19.082 30.589-16.678 48.633c17.64 1.365 35.66-8.964 46.64-22.262' />
            </svg>
          </button>
          <button className='auth-button auth-oauth-button right'>
            <svg
              className='logo'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
            >
              <path
                fill='currentColor'
                d='M20 10.25q0 3.351-1.908 6.027t-4.928 3.703q-.352.068-.514-.093a.54.54 0 0 1-.163-.4V16.67q0-1.295-.677-1.895a9 9 0 0 0 1.335-.24q.591-.16 1.223-.52a3.7 3.7 0 0 0 1.055-.888q.423-.528.69-1.402t.267-2.008q0-1.616-1.028-2.75q.48-1.214-.105-2.723q-.364-.12-1.054.147a7 7 0 0 0-1.198.587l-.495.32a9 9 0 0 0-2.5-.346a9 9 0 0 0-2.5.347a12 12 0 0 0-.553-.36q-.345-.214-1.088-.514q-.741-.3-1.12-.18q-.572 1.507-.09 2.722q-1.03 1.134-1.03 2.75q0 1.134.268 2.002q.267.867.683 1.401a3.5 3.5 0 0 0 1.048.894q.632.36 1.224.52q.593.162 1.335.241q-.52.48-.638 1.375a2.5 2.5 0 0 1-.586.2a3.6 3.6 0 0 1-.742.067q-.43 0-.853-.287q-.423-.288-.723-.834a2.1 2.1 0 0 0-.631-.694q-.384-.267-.645-.32l-.26-.04q-.273 0-.378.06t-.065.153a.7.7 0 0 0 .117.187a1 1 0 0 0 .17.16l.09.066q.287.135.567.508q.28.374.41.68l.13.307q.17.507.574.821q.404.315.872.4q.468.087.905.094q.436.006.723-.047l.299-.053q0 .507.007 1.188l.006.72q0 .24-.17.4q-.168.162-.52.094q-3.021-1.028-4.928-3.703Q0 13.6 0 10.25q0-2.79 1.341-5.145a10.1 10.1 0 0 1 3.64-3.73A9.6 9.6 0 0 1 10 0a9.6 9.6 0 0 1 5.02 1.375a10.1 10.1 0 0 1 3.639 3.73Q20 7.461 20 10.25'
              />
            </svg>
          </button>
        </div> */}

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
