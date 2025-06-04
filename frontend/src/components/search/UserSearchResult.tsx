import { useNavigate } from "react-router-dom";
import { SearchUser } from "../../models/SearchResult";
import { generateColorFromText } from "../../utils/colorUtils";

export default function UserResult({ user }: { user: SearchUser }) {
  const navigate = useNavigate();
  
  // Generate a consistent color based on the username
  const placeholderColor = generateColorFromText(user.username);

  /**
   * handleClick() -> void
   *
   * @description
   * On a click, this redirects the user to the selected user's page.
   *
   * @returns void
   */
  const handleClick = () => {
    navigate(`/profile/${user.user_id}`);
  };

  return (
    <div className='userSearchResults' onClick={handleClick}>
      <div className='profile-picture-container'>
        {user && user.profile_image ? (
          <img
            src={user.profile_image}
            width={50}
            height={50}
            alt='Profile Picture'
            className='profile-picture'
          />
        ) : (
          <div 
            className='no-profile-picture-container'
            style={{ backgroundColor: placeholderColor }}
          >
            <h1 className='no-profile-picture'>
              {user?.username?.[0].toUpperCase() || "U"}
            </h1>
          </div>
        )}
      </div>

      <div className="user-info">
        <h3>{user.first_name} {user.last_name}</h3>
        <p className="username">@{user.username}</p>
      </div>
    </div>
  );
}
