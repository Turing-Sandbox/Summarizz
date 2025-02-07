"use client";

import { apiURL } from "@/app/scripts/api";
import axios from "axios";
import { useState } from "react";
//import "../styles/profile.scss";
import "../styles/ProfileManagement.scss";
import { useAuth } from "@/hooks/AuthProvider";
// import { auth } from "../../lib/firebaseClientConfig";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  getAuth,
} from "firebase/auth";
import Navbar from "../Navbar";

/**
 * ProfileManagement() -> JSX.Element
 *
 * @description
 * Renders the Profile Management page, allowing users to manage their profile.
 *
 * @returns JSX.Element
 */
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
  const { user, userUID } = useAuth(); // Get logged in user's UID

  // ---------------------------------------
  // ------------ Event Handlers -----------
  // ---------------------------------------
  /**
   * handleChangePassword() -> void
   *
   * @description
   * Handles the change password form, setting the error and success states
   * to an empty string and calling the backend to change the password.
   *
   * @param e - Form Event
   * @returns void
   */
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
      setSuccess("Password has been successfully updated.");
    } catch (error) {
      console.error("Error changing password:", error);
      setError(
        "Failed to update password. Please check your current password and try again."
      );
    }
  };

  /**
   * handleUpdateEmailUsername() -> void
   *
   * @description
   * Handles the update email or username form, setting the error and success states
   * to an empty string and calling the backend to update the email or username.
   *
   * @param e - Form Event
   * @returns void
   */
  const handleUpdateEmailUsername = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("No user is signed in.");
      return;
    }

    if (!user.email) {
      setError("User does not have an email associated with their account.");
      return;
    }

    if (!currentPassword) {
      setError("Please provide your current password.");
      return;
    }

    // Check if at least one field is provided
    if (!newEmail && !newUsername) {
      setError("Please provide a new email or username.");
      return;
    }

    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // If a new email is provided, initiate verifyBeforeUpdateEmail client-side

      if (newEmail && newEmail !== user?.email) {
        await verifyBeforeUpdateEmail(user!, newEmail);
        setSuccess(
          "A verification link has been sent to your new email. Please verify it to complete the update."
        );
      }

      // If a new username is provided, update it via server
      if (newUsername) {
        await axios.put(`${apiURL}/user/${userUID}`, { username: newUsername });
        setSuccess((prev) =>
          prev
            ? prev + " Username updated successfully."
            : "Username updated successfully."
        );
      }
    } catch (err: any) {
      console.error("Error updating email/username:", err);
      setError(err.message || "Failed to update information.");
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
          <form
            onSubmit={handleChangePassword}
            className='change-password-form'
          >
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
          <form
            onSubmit={handleUpdateEmailUsername}
            className='update-info-form'
          >
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
              <label htmlFor='newEmail'>New Email</label>
              <input
                type='email'
                id='newEmail'
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='newUsername'>New Username</label>
              <input
                type='text'
                id='newUsername'
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            {error && <p className='error-message'>{error}</p>}
            {success && <p className='success-message'>{success}</p>}

            <button type='submit' className='update-info-button'>
              Update Information
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
