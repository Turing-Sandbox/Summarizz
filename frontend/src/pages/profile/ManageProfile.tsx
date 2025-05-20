import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { User } from "../../models/User";
import UserService from "../../services/UserService";

export default function ManageProfile() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const { id } = useParams();
  const auth = useAuth();

  const [user, setUser] = useState<User | null>(auth.user || null);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [imageError, setImageError] = useState("");
  const [errorEditProfile, setErrorEditProfile] = useState("");
  const [successEditProfile, setSuccessEditProfile] = useState("");

  const [activeTab, setActiveTab] = useState<"password" | "email" | "username">(
    "password"
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorEditPassword, setErrorEditPassword] = useState("");
  const [successEditPassord, setSuccessEditPassord] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [errorEditEmail, setErrorEditEmail] = useState("");
  const [successEditEmail, setSuccessEditEmail] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [errorEditUsername, setErrorEditUsername] = useState("");
  const [successEditUsername, setSuccessEditUsername] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorDeleteAccount, setErrorDeleteAccount] = useState("");
  const [successDeleteAccount, setSuccessDeleteAccount] = useState("");

  // ---------------------------------------
  // ------------ Event Handlers -----------
  // ---------------------------------------

  // Update profile image if it exists
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImagePreview(user.profileImage);
    }
  }, [user]);

  /**
   * @description
   * Handles the file upload for the thumbnail, and sets the thumbnail preview
   * to the file that was uploaded. If the file is not an image, or one was not provided, it
   * will throw and error indicating that the thumbnail was not set and to try again.
   *
   * @param e - Change Event for Thumbnail File
   * @returns void
   */
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files ? e.target.files[0] : null;

    if (file && file.type.startsWith("image/")) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    } else {
      setProfileImage(null);
      setProfileImagePreview(null);
      setImageError("Please select a valid image file.");
    }
  };

  /**
   * @description
   * Handles the edit profile form, setting the error and success states
   * to an empty string and calling the backend to update the user profile.
   *
   * @param e - Form Event
   * @returns void
   */

  const handleEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorEditProfile("");
    setSuccessEditProfile("");

    // 1- Validation
    if (!user) {
      setErrorEditProfile("No user found.");
      return;
    }

    if (!user?.firstName || !user?.lastName) {
      setErrorEditProfile("Please fill out all fields with: *.");
      return;
    }

    if (profileImage && profileImage.size > 5000000) {
      setErrorEditProfile("Profile image must be less than 5MB.");
      return;
    }

    if (user?.phone && user.phone.length > 15) {
      setErrorEditProfile("Please provide a valid phone number.");
      return;
    }

    if (user?.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const currentDate = new Date();
      if (dob > currentDate) {
        setErrorEditProfile("Please provide a valid date of birth.");
        return;
      }
    }

    // 2- Send upload image request to backend if profile image exists
    if (profileImage) {
      await uploadProfileImage();
    }

    // 3- Update user profile

    const res = await UserService.updateUserWithID(user);

    // 3- Handle error response
    if (res instanceof Error) {
      setErrorEditProfile(res.message);
      return;
    }

    // 4- Update user in auth provider
    auth.setUser(user);
    setSuccessEditProfile("Profile has been successfully updated.");
  };

  /**
   * @description
   * Uploads the profile image to the backend, and sets the user's profile image
   * to the new profile image.
   *
   * @returns void
   */
  const uploadProfileImage = async () => {
    if (!user) {
      setErrorEditProfile("No user found.");
      return;
    }

    if (!profileImage) {
      setErrorEditProfile("No profile image found.");
      return;
    }

    const oldProfileImage = user.profileImage || "";

    const response = await UserService.uploadProfileImage(
      profileImage,
      oldProfileImage
    );

    if (response instanceof Error) {
      setErrorEditProfile(response.message);
      return;
    }

    setUser({ ...user, profileImage: response.url });
  };

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
    setErrorEditPassword("");
    setSuccessEditPassord("");

    if (!id) {
      setErrorEditPassword("No user found.");
      return;
    }

    const response = await UserService.changePassword(
      id,
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (response instanceof Error) {
      setErrorEditPassword(response.message);
      return;
    }

    setSuccessEditPassord("Password has been successfully updated.");
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
  const handleUpdateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorEditEmail("");
    setSuccessEditEmail("");

    if (!auth.user || !id) {
      setErrorEditEmail("No user is signed in.");
      return;
    }

    if (!auth.user.email) {
      setErrorEditEmail(
        "User does not have an email associated with their account."
      );
      return;
    }

    if (!currentPassword) {
      setErrorEditEmail("Please provide your current password.");
      return;
    }

    if (!newEmail) {
      setErrorEditEmail("Please provide a new email.");
      return;
    }

    // Send a request to the backend to change the email
    const response = await UserService.changeEmail(
      id,
      newEmail,
      currentPassword
    );

    if (response instanceof Error) {
      setErrorEditEmail(response.message);
      return;
    }

    auth.setUser({ ...auth.user, email: newEmail });
    setSuccessEditEmail(response.message);
  };

  /**
   * handleUpdateUsername() -> void
   *
   * @description
   * Handles the update username form, setting the error and success states
   * to an empty string and calling the backend to update the username.
   *
   * @param e - Form Event
   * @returns void
   */
  const handleUpdateUsername = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorEditUsername("");
    setSuccessEditUsername("");

    if (!auth.user || !id) {
      setErrorEditUsername("No user is signed in.");
      return;
    }

    if (!newUsername) {
      setErrorEditUsername("Please provide a new username.");
      return;
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      setErrorEditUsername(
        "Username must be between 3 and 20 characters in length."
      );
      return;
    }

    if (!/^[a-zA-Z0-9_]*$/.test(newUsername)) {
      setErrorEditUsername(
        "Username must only contain letters, numbers, and underscores."
      );
      return;
    }

    // Send a request to the backend to change the email
    const response = await UserService.changeUsername(id, newUsername);

    if (response instanceof Error) {
      setErrorEditUsername(response.message);
      return;
    }

    auth.setUser({ ...auth.user, username: newUsername });
    setSuccessEditUsername(response.message);
  };

  const handleDeleteAccount = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    setErrorDeleteAccount("");
    setSuccessDeleteAccount("");

    if (!email) {
      setErrorDeleteAccount("Please provide your email.");
      return;
    }

    if (!password) {
      setErrorDeleteAccount("Please provide your password.");
      return;
    }

    if (!id) {
      setErrorDeleteAccount("No user found.");
      return;
    }

    const response = await UserService.deleteUserWithID(id, email, password);

    if (response instanceof Error) {
      setErrorDeleteAccount(response.message);
      return;
    }

    setSuccessDeleteAccount(response.message);

    // Log the user out
    auth.logout();
  };

  return (
    <div className='main-content'>
      {/******************** EDIT PROFILE  ********************/}
      <div className='profile-management-section'>
        <h2>Edit Profile</h2>

        <form onSubmit={handleEditProfile}>
          {/* Profile Image */}
          <div className='profile-image-section'>
            <div className='input-group'>
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  width={200}
                  height={200}
                  alt='Profile Picture'
                  className='profile-edit-image'
                />
              ) : (
                <h1 className='profile-edit-image profile-initial'>
                  {user?.username[0].toUpperCase()}
                </h1>
              )}
            </div>

            <div>
              <label htmlFor='profile-image' className='profile-image-upload'>
                {profileImage ? "Change" : "Upload"} Profile Image
              </label>
              <input
                id='profile-image'
                type='file'
                accept='image/*'
                onChange={handleProfileImageChange}
              />
              {imageError && <p className='error-message'>{imageError}</p>}
            </div>
          </div>

          <div className='form-group'>
            {/* First Name */}
            <div className='input-group'>
              <label htmlFor='firstName'>First Name *</label>
              <input
                type='text'
                id='firstName'
                placeholder='First Name'
                value={user?.firstName ? user.firstName : ""}
                onChange={(e) =>
                  setUser(user ? { ...user, firstName: e.target.value } : null)
                }
              />
            </div>

            {/* Last Name */}
            <div className='input-group'>
              <label htmlFor='lastName'>Last Name *</label>
              <input
                type='text'
                id='lastName'
                placeholder='Last Name'
                value={user?.lastName ? user.lastName : ""}
                onChange={(e) =>
                  setUser(user ? { ...user, lastName: e.target.value } : null)
                }
              />
            </div>
          </div>

          {/* Bio */}
          <div className='input-group'>
            <label htmlFor='bio'>Bio</label>
            <textarea
              id='bio'
              placeholder='Tell us about yourself...'
              value={user?.bio ? user.bio : ""}
              onChange={(e) =>
                setUser(user ? { ...user, bio: e.target.value } : null)
              }
            />
          </div>

          {/* Phone */}
          <div className='input-group'>
            <label htmlFor='phone'>Phone</label>
            <input
              type='tel'
              id='phone'
              placeholder='(123) 321-1234'
              value={user?.phone ? user.phone : ""}
              onChange={(e) =>
                setUser(user ? { ...user, phone: e.target.value } : null)
              }
            />
          </div>

          {/* Date of Birth */}
          <div className='input-group'>
            <label htmlFor='dob'>Date of Birth</label>
            <input
              type='date'
              id='dob'
              value={user?.dateOfBirth ? user.dateOfBirth : ""}
              onChange={(e) =>
                setUser(user ? { ...user, dateOfBirth: e.target.value } : null)
              }
            />
          </div>

          {/* Privacy Setting */}
          <div className='input-group'>
            <label htmlFor='isPrivate'>Make Profile Private</label>
            <input
              type='checkbox'
              id='isPrivate'
              checked={user?.isPrivate || false}
              onChange={(e) =>
                setUser(user ? { ...user, isPrivate: e.target.checked } : null)
              }
            />
          </div>

          {errorEditProfile && (
            <p className='error-message'>{errorEditProfile}</p>
          )}

          {successEditProfile && (
            <p className='success-message'>{successEditProfile}</p>
          )}

          <button type='submit' className='save-button'>
            Save Changes
          </button>
        </form>
      </div>

      {/******************** EDIT CREDENTIALS  ********************/}
      <div className='profile-management-section'>
        <h2>Edit Credentials</h2>

        {/* TABS */}
        <div className='tabs'>
          <button
            className={
              "tab first-tab" + (activeTab === "password" ? " active-tab" : "")
            }
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>
          <button
            className={"tab" + (activeTab === "email" ? " active-tab" : "")}
            onClick={() => setActiveTab("email")}
          >
            Change Email
          </button>
          <button
            className={
              "tab last-tab" + (activeTab === "username" ? " active-tab" : "")
            }
            onClick={() => setActiveTab("username")}
          >
            Change Username
          </button>
        </div>

        {/* PASSWORD */}
        {activeTab === "password" && (
          <div className='tab-content'>
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className='input-group'>
                <label htmlFor='currentPassword'>Current Password</label>
                <input
                  type='password'
                  id='currentPassword'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
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
                  />
                </div>

                <div className='input-group'>
                  <label htmlFor='confirmPassword'>Confirm New Password</label>
                  <input
                    type='password'
                    id='confirmPassword'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {errorEditPassword && (
                <p className='error-message'>{errorEditPassword}</p>
              )}
              {successEditPassord && (
                <p className='success-message'>{successEditPassord}</p>
              )}

              <button type='submit' className='save-button'>
                Change Password
              </button>
            </form>
          </div>
        )}

        {/* EMAIL */}

        {activeTab === "email" && (
          <div className='tab-content'>
            <h3>Change Email</h3>
            <form onSubmit={handleUpdateEmail}>
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
                />
              </div>

              {errorEditEmail && (
                <p className='error-message'>{errorEditEmail}</p>
              )}
              {successEditEmail && (
                <p className='success-message'>{successEditEmail}</p>
              )}

              <button type='submit' className='save-button'>
                Change Email
              </button>
            </form>
          </div>
        )}

        {/* USERNAME */}
        {activeTab === "username" && (
          <div className='tab-content'>
            <h3>Change Username</h3>
            <form onSubmit={handleUpdateUsername}>
              <div className='input-group'>
                <label htmlFor='newUsername'>New Username</label>
                <input
                  type='text'
                  id='newUsername'
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              {errorEditUsername && (
                <p className='error-message'>{errorEditUsername}</p>
              )}
              {successEditUsername && (
                <p className='success-message'>{successEditUsername}</p>
              )}

              <button type='submit' className='save-button'>
                Change Username
              </button>
            </form>
          </div>
        )}
      </div>

      {/******************** DELETE ACCOUNT  ********************/}
      <div className='profile-management-section'>
        <h2>Delete Account</h2>

        <div className='input-group'>
          <label htmlFor='email'>Enter Email</label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className='input-group'>
          <label htmlFor='password'>Enter Password</label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <p>
          By pressing "Delete Account", I acknowledge the account will be
          deleted from this platform as well as all the content related. There
          is no recovery once an account is deleted.
        </p>

        {errorDeleteAccount && (
          <p className='error-message'>{errorDeleteAccount}</p>
        )}
        {successDeleteAccount && (
          <p className='success-message'>{successDeleteAccount}</p>
        )}

        <button onClick={handleDeleteAccount} className='save-button warning'>
          Delete Account
        </button>
      </div>
    </div>
  );
}
