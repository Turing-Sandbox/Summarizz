import { BellIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Notification } from "../models/Notification";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import NotificationList from "./notification/NotificationList";
import { SubscriptionService } from "../services/SubscriptionService";
import SearchBar from "./search/SearchBar";
import NotificationService from "../services/NotificationService";

export default function Navbar() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProUser, setIsProUser] = useState<boolean>(false);

  const auth = useAuth();
  const navigate = useNavigate();

  // ---------------------------------------
  // ------------ Event Handler ------------
  // ---------------------------------------

  // Dark Mode handling
  useEffect(() => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    const preferenceMode = localStorage.getItem("isDarkMode");

    // Check if user has a saved preference in cookies
    if (preferenceMode) {
      if (preferenceMode === "true") {
        document.documentElement.setAttribute("data-theme", "dark");
        setIsDarkMode(true);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        setIsDarkMode(false);
      }
    }

    // If notCheck system preference as default.
    if (!preferenceMode) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");

      if (mq.matches) {
        setIsDarkMode(true);
      }

      // This callback will fire if the perferred color scheme changes without a reload
      mq.addEventListener("change", (evt) => setIsDarkMode(evt.matches));
    }
  }, []);

  // Update user info
  useEffect(() => {
    if (auth.isAuthenticated) {
      // Only call these functions when the auth state is initialized
      fetchNotifications();
      checkSubscriptionStatus();
    }
  }, []);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  const toggleTheme = () => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    const newTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("isDarkMode", isDarkMode ? "false" : "true");
  };

  const notificationsBellClicked = () => {
    // 1 - Show or hide the notification list
    setShowNotificationList(!showNotificationList);

    // 2 - Hide the search results and menu (Other menus)
    setShowMenu(false);

    // 3 Mark notifications as read if needed
    if (!showNotificationList && unreadCount > 0) {
      markRead();
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("title");
    }
    auth.logout();
  };

  const markRead = async () => {
    if (auth.user === null) {
      return;
    }

    const response = await NotificationService.markAsRead(auth.user.uid);

    if (response instanceof Error) {
      console.error("Error marking notification as read: ", response);
      return;
    }
  };

  const fetchNotifications = async (): Promise<void> => {
    // Only fetch notifications if user is authenticated and has a UID
    if (!auth.isAuthenticated || !auth.user?.uid) {
      return;
    }

    // Fetch notifications from the backend
    const notificationsResult = await NotificationService.getNotifications(
      auth.user.uid
    );

    if (notificationsResult instanceof Error) {
      console.error("Error fetching notifications:", notificationsResult);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    console.log("Fetched notifications:", notificationsResult);

    // Set notifications state
    setNotifications(notificationsResult);

    // Count unread notifications
    const unreadCount = notificationsResult.reduce(
      (count, notification) => count + (!notification.read ? 1 : 0),
      0
    );
    setUnreadCount(unreadCount);
  };

  const checkSubscriptionStatus = async (): Promise<void> => {
    if (!auth.isAuthenticated) return;

    const subscriptionStatus =
      await SubscriptionService.getSubscriptionStatus();

    if (subscriptionStatus instanceof Error) {
      console.error("Error fetching subscription status:", subscriptionStatus);
      setIsProUser(false);
    } else {
      setIsProUser(
        subscriptionStatus &&
          subscriptionStatus.status === "active" &&
          !subscriptionStatus.canceledAt
      );
    }
  };

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      {(showMenu || showNotificationList) && (
        <div
          className='navbar-page-overlay'
          onClick={() => {
            setShowMenu(false);
            setShowNotificationList(false);
          }}
        ></div>
      )}
      <div className='navbar-background'>
        {/* App Name */}
        <a
          onClick={() => {
            setShowMenu(false);
            navigate("/");
          }}
        >
          <h1 className='navbar-title summarizz-logo'>Summarizz</h1>
        </a>

        {/* Create New Content */}
        {auth.isAuthenticated ? (
          <>
            <div className='searchBarContainer search-large-screen'>
              <SearchBar />
            </div>

            <button
              className='navbar-button navbar-button-large-screen'
              onClick={() => {
                navigate("/content/create");
                localStorage.removeItem("title");
                Cookies.remove("content");
              }}
            >
              Create Content
            </button>

            {/* Notifications */}
            <div>
              <div
                onClick={notificationsBellClicked}
                className='notification-button notification-button-large-screen'
              >
                <BellIcon className='icon' />
                {unreadCount > 0 && <span>{unreadCount}</span>}
              </div>

              {showNotificationList && (
                <div className='notification-list-container'>
                  <NotificationList
                    notifications={notifications}
                    unreadCount={unreadCount}
                    setUnreadCount={setUnreadCount}
                  />
                </div>
              )}
            </div>

            {/* Profile Picture */}
            <div
              className='profile-picture-container profile-picture-container-large-screen'
              onClick={() => {
                setShowMenu(!showMenu);
                setShowNotificationList(false);
              }}
            >
              {auth.user && auth.user.profileImage ? (
                <img
                  src={auth.user.profileImage}
                  width={50}
                  height={50}
                  alt='Profile Picture'
                  className='profile-picture'
                />
              ) : (
                <div className='no-profile-picture-container'>
                  <h1 className='no-profile-picture'>
                    {auth.user?.username[0].toUpperCase() || ""}
                  </h1>
                </div>
              )}
            </div>

            {/* Theme Slider */}
            <label className='theme-toggle'>
              <input
                type='checkbox'
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className='slider'></span>
            </label>
          </>
        ) : (
          <div className='navbar-auth'>
            <a
              className='navbar-link'
              onClick={() => navigate("/authentication/login")}
            >
              Login
            </a>
            <a
              className='navbar-link padding-right'
              onClick={() => navigate("/authentication/register")}
            >
              Register
            </a>

            {/* Theme Slider */}
            <label className='theme-toggle slider-auth'>
              <input
                type='checkbox'
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className='slider slider-auth'></span>
            </label>
          </div>
        )}
      </div>

      {/* Profile Menu */}
      {showMenu && (
        <div className='menu'>
          <>
            {/* MOBILE DISPLAY */}
            <div className='menu-header'>
              {/* Close Menu */}
              <div
                className='close-menu'
                onClick={() => {
                  setShowMenu(false);
                  setShowNotificationList(false);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='icon icon-tabler icon-tabler-x'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                  stroke='currentColor'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                  <path d='M18 6l-12 12' />
                  <path d='M6 6l12 12' />
                </svg>
              </div>

              {/* User Info */}
              <div className='menu-user-info'>
                <div className='menu-profile-picture-container'>
                  {auth.user && auth.user.profileImage ? (
                    <img
                      src={auth.user.profileImage}
                      width={50}
                      height={50}
                      alt='Profile Picture'
                      className='profile-picture'
                    />
                  ) : (
                    <div className='no-profile-picture-container'>
                      <h1 className='no-profile-picture'>
                        {auth.user?.username[0].toUpperCase() || ""}
                      </h1>
                    </div>
                  )}
                </div>
                <div className='menu-user-details'>
                  <h3>
                    {auth.user?.firstName} {auth.user?.lastName}
                  </h3>
                  <p>@{auth.user?.username}</p>
                </div>
              </div>

              {/* Search Bar for Mobile */}
              <div className='searchBarContainer search-small-screen'>
                <SearchBar />
              </div>

              {/* Create New Content for Mobile */}
              <button
                className='navbar-button navbar-button-small-screen'
                onClick={() => {
                  navigate("/content/create");
                  localStorage.removeItem("title");
                  Cookies.remove("content");
                }}
              >
                Create Content
              </button>

              {/* Notifications for Mobile */}
              <div>
                <div
                  onClick={notificationsBellClicked}
                  className='notification-button notification-button-small-screen'
                >
                  <BellIcon className='icon' />
                  {unreadCount > 0 && <span>{unreadCount}</span>}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className='menu-items'>
              <div
                className='menu-item'
                onClick={() => {
                  navigate(`/profile/${auth.user?.uid}`);
                  setShowMenu(false);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='icon icon-tabler icon-tabler-user'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                  stroke='currentColor'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                  <path d='M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0' />
                  <path d='M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2' />
                </svg>
                <p>Profile</p>
              </div>

              <div
                className='menu-item'
                onClick={() => {
                  navigate("/settings");
                  setShowMenu(false);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='icon icon-tabler icon-tabler-settings'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                  stroke='currentColor'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                  <path d='M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z' />
                  <path d='M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0' />
                </svg>
                <p>Settings</p>
              </div>

              <div
                className='menu-item'
                onClick={() => {
                  navigate("/subscription");
                  setShowMenu(false);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='icon icon-tabler icon-tabler-star'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                  stroke='currentColor'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                  <path d='M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z' />
                </svg>
                <p>
                  {isProUser
                    ? "Manage Subscription"
                    : "Upgrade to Pro"}
                </p>
              </div>

              <div
                className='menu-item'
                onClick={() => {
                  handleLogout();
                  setShowMenu(false);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='icon icon-tabler icon-tabler-logout'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                  stroke='currentColor'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                  <path d='M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2' />
                  <path d='M9 12h12l-3 -3' />
                  <path d='M18 15l3 -3' />
                </svg>
                <p>Logout</p>
              </div>
            </div>
          </>
        </div>
      )}
    </>
  );
}
