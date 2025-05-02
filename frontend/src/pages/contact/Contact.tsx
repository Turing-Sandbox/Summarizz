import axios from "axios";
import { useEffect, useState } from "react";
import { apiURL } from "../../scripts/api";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [countdown, setCountdown] = useState(60);

  // Countdown timer for button (avoid spamming)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isButtonDisabled && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsButtonDisabled(false);
      setCountdown(60);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isButtonDisabled, countdown]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await axios.post(`${apiURL}/contact`, {
        email,
        name,
        message,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("✓ Message sent! We will respond within 48 hours.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    } catch {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsButtonDisabled(true);
      setIsLoading(false);
    }
  }

  return (
    <div className='main-content'>
      <h1>Contact Us</h1>
      <p>
        For any questions, concerns, or feedback, please fill out this form.
        Someone from our team will respond to you within 48 hours.
      </p>

      {/* TODO: IMPLEMENT CONTACT MODULE WITH DATABASE DETAILS 
      STORED FOR ACCESSIBILITY BY ALL TEAM MEMBER??? */}
      <form onSubmit={handleSubmit}>
        <div className='input-group'>
          <label htmlFor='name'>Name:</label>
          <input
            type='text'
            id='name'
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <label htmlFor='email'>Email:</label>
        <input
          type='email'
          id='email'
          name='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor='message'>Message:</label>
        <textarea
          id='message'
          name='message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button className='save-button' type='submit'>
          Submit
        </button>
        {successMessage && <p className='success-message'>{successMessage}</p>}
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        {isLoading && <p>Loading...</p>}
      </form>
    </div>
  );
}
