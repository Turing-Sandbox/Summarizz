import "../../styles/authentication.scss";

function Register() {
  return (
    <>
      <div className='auth-box'>
        <h1 className='auth-title'>Register</h1>

        <form className='auth-form'>
          <input type='text' placeholder='Username' className='auth-input' />
          <input type='email' placeholder='Email' className='auth-input' />
          <input
            type='password'
            placeholder='Password'
            className='auth-input'
          />
          <input
            type='password'
            placeholder='Confirm Password'
            className='auth-input'
          />

          <button type='submit' className='auth-button'>
            Register
          </button>
        </form>

        <a href='/login' className='auth-link'>
          <p>
            Already have an account? <b>Login</b>
          </p>
        </a>
      </div>
    </>
  );
}

export default Register;
