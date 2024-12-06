import Navbar from "@/app/components/Navbar";
import { apiURL } from "@/app/scripts/api";
import axios from "axios";
import { useState } from "react";
//import "../styles/profile.scss";
import "../styles/ProfileManagement.scss"
import { useAuth } from "@/app/hooks/AuthProvider";

export default function ProfileManagement() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const { userUID } = useAuth(); // Get logged in user's UID

  // ---------------------------------------
  // ------------ Event Handler ------------
  // ---------------------------------------

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      // Send a request to the backend to change the password
      await axios.post(`${apiURL}/user/${userUID}/change-password`, {
        userId: userUID,
        currentPassword,
        newPassword,
      });
      setSuccess("Password updated successfully.");
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Failed to update password. Please check your current password and try again.");
    }
  };

// Change Email or Username Handler
const handleUpdateEmailUsername = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!newEmail && !newUsername) {
    setError("Please provide a new email or username.");
    return;
  }

  try {
    await axios.post(`${apiURL}/user/${userUID}/change-email-username`, {
      currentPassword,
      newEmail,
      newUsername,
    });
    setSuccess("Information updated successfully.");
  } catch (error: any) {
    console.error("Error updating email/username:", error);
    setError(error.response?.data?.error || "Failed to update information.");
  }
};


  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <Navbar />
      <div className='main-content'>
        <div className='profile-management-section'>
          <h1>Profile Management</h1>
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword} className='change-password-form'>
            <div className='form-group'>
              <label htmlFor='currentPassword'>Current Password</label>
              <input
                type='password'
                id='currentPassword'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='newPassword'>New Password</label>
              <input
                type='password'
                id='newPassword'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <label htmlFor='confirmPassword'>Confirm New Password</label>
              <input
                type='password'
                id='confirmPassword'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className='error-message'>{error}</p>}
            {success && <p className='success-message'>{success}</p>}

            <button type='submit' className='change-password-button'>
              Change Password
            </button>
          </form>
          <h2>Change Email or Username</h2>
          <form onSubmit={handleUpdateEmailUsername} className="update-info-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newEmail">New Email</label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newUsername">New Username</label>
              <input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <button type="submit" className="update-info-button">
              Update Information
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
