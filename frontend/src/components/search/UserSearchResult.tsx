import { useNavigate } from "react-router-dom";
import { User } from "../../models/User";

export default function UserResult({ user }: { user: User }) {
  const navigate = useNavigate();

  /**
   * handleClick() -> void
   *
   * @description
   * On a click, this redirects the user to the selected user's page.
   *
   * @returns void
   */
  const handleClick = () => {
    navigate(`/profile/${user.uid}`);
  };

  return (
    <div className='userSearchResults' onClick={handleClick}>
      <div className='profile-picture-container'>
        {user && user.profileImage ? (
          <img
            src={user.profileImage}
            width={50}
            height={50}
            alt='Profile Picture'
            className='profile-picture'
          />
        ) : (
          <div className='no-profile-picture-container'>
            <h1 className='no-profile-picture'>
              {user?.username?.[0].toUpperCase() || "U"}
            </h1>
          </div>
        )}
      </div>

      <h3>
        {user.firstName} {user.lastName}
      </h3>
    </div>
  );
}
