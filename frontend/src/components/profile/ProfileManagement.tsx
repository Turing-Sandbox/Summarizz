"use client";

import { apiURL } from "@/app/scripts/api";
import axios from "axios";
import { useState } from "react";
//import "../styles/profile.scss";
import "@/app/styles/profile/ProfileManagement.scss";
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
        {/******************** EDIT PROFILE  ********************/}
        <div className='profile-management-section'>
          <h2>Edit Profile</h2>

          <form>
            {/* TODO: Profile Image */}
            <div className='input-group'>
              <label htmlFor='profileImage'>Profile Image</label>
              <input
                type='file'
                id='profileImage'
                accept='image/*'
                // onChange={handleProfileImageChange}
              />
            </div>

            <div className='form-group'>
              {/* TODO: First Name */}
              <div className='input-group'>
                <label htmlFor='firstName'>First Name</label>
                <input
                  type='text'
                  id='firstName'
                  placeholder='First Name'
                  // value={firstName}
                  // onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              {/* TODO: Last Name */}
              <div className='input-group'>
                <label htmlFor='lastName'>Last Name</label>
                <input
                  type='text'
                  id='lastName'
                  placeholder='Last Name'
                  // value={lastName}
                  // onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* TODO: Bio */}
            <div className='input-group'>
              <label htmlFor='bio'>Bio</label>
              <textarea
                id='bio'
                placeholder='Tell us about yourself...'
                // value={bio}
                // onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>

            {/* TODO: Phone */}
            <div className='input-group'>
              <label htmlFor='phone'>Phone</label>
              <input
                type='tel'
                id='phone'
                placeholder='(123) 321-1234'
                // value={phone}
                // onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* TODO: Date of Birth */}
            <div className='input-group'>
              <label htmlFor='dob'>Date of Birth</label>
              <input
                type='date'
                id='dob'
                // value={dob}
                // onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>
          </form>
        </div>

        {/******************** EDIT CREDENTIALS  ********************/}
        <div className='profile-management-section'>
          <h2>Edit Credentials</h2>
          <h3>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className='input-group'>
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
              <div className='input-group'>
                <label htmlFor='newPassword'>New Password</label>
                <input
                  type='password'
                  id='newPassword'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className='input-group'>
                <label htmlFor='confirmPassword'>Confirm New Password</label>
                <input
                  type='password'
                  id='confirmPassword'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className='error-message'>{error}</p>}
            {success && <p className='success-message'>{success}</p>}

            <button type='submit' className='save-button'>
              Change Password
            </button>
          </form>

          <h3>Change Email</h3>
          <form onSubmit={handleUpdateEmailUsername}>
            <div className='input-group'>
              <label htmlFor='newEmail'>New Email</label>
              <input
                type='email'
                id='newEmail'
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className='input-group'>
              <label htmlFor='currentPassword'>Enter Password</label>
              <input
                type='password'
                id='currentPassword'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className='error-message'>{error}</p>}
            {success && <p className='success-message'>{success}</p>}

            <button type='submit' className='save-button'>
              Change Email
            </button>
          </form>

          <h3>Change Username</h3>
          <form onSubmit={handleUpdateEmailUsername}>
            <div className='input-group'>
              <label htmlFor='newUsername'>New Username</label>
              <input
                type='text'
                id='newUsername'
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            <div className='input-group'>
              <label htmlFor='currentPassword'>Enter Password</label>
              <input
                type='password'
                id='currentPassword'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className='error-message'>{error}</p>}
            {success && <p className='success-message'>{success}</p>}

            <button type='submit' className='save-button'>
              Change Username
            </button>
          </form>
        </div>

        {/******************** DELETE ACCOUNT  ********************/}
        <div className='profile-management-section'>
          <h2>Delete Account</h2>
        </div>
      </div>
    </>
  );
}
