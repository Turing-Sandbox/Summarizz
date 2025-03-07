"use client";

import { User } from "@/models/User";
import { useRouter } from "next/navigation";
import "@/app/styles/navbar.scss"


const UserResult = ({ user }: { user: User }) => {
  const router = useRouter();


  /**
   * handleClick() -> void
   *
   * @description
   * On a click, this redirects the user to the selected user's page.
   *
   * @returns void
   */
  const handleClick = () => {
    router.push(`/profile/${user.uid}`);
  };

  return (
    <div className="userSearchResults" onClick={handleClick}>

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

      <h1>{user.firstName} {user.lastName}</h1>
    </div>
  );
};

export default UserResult;
