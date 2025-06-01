import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import AuthProvider from "./hooks/AuthProvider";
import NavbarWrapper from "./components/NavbarWrapper";
import Background from "./components/Background";
import Feed from "./pages/Feed";
import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import Profile from "./pages/profile/Profile";
import ManageProfile from "./pages/profile/ManageProfile";
import About from "./pages/contact/About";
import Contact from "./pages/contact/Contact";
import TermsOfService from "./pages/legals/TermsOfService";
import PrivacyPolicy from "./pages/legals/PrivacyPolicy";
import CookiePolicy from "./pages/legals/CookiePolicy";
import AIDisclaimer from "./pages/legals/AIDisclaimer";
import Accessibility from "./pages/legals/Accessibility";
import ResetPassword from "./pages/authentication/ResetPassword";
import CallbackAuthentication from "./pages/authentication/CallbackAuthentication";
import PopupCallback from "./pages/authentication/PopupCallback";
import ContentEditor from "./pages/content/ContentEditor";
import ContentView from "./pages/content/ContentView";
import ProDetails from "./pages/pro/ProDetails";
import ManageSubscription from "./pages/pro/ManageSubscription";
import SubscribePro from "./pages/pro/SubscribePro";

// STYLES
import "./styles/authentication/authentication.scss";

import "./styles/content/contentPreviewPopup.scss";
import "./styles/content/contentTile.scss";
import "./styles/content/createContent.scss";
import "./styles/content/toolbar.scss";
import "./styles/content/viewContent.scss";

import "./styles/notifications/notifications.scss";

import "./styles/profile/profile.scss";
import "./styles/profile/profileManagement.scss";

import "./styles/search/search.scss";

import "./styles/feed.scss";
import "./styles/footer.scss";
import "./styles/manage-subscription.scss";
import "./styles/navbar.scss";
import "./styles/pro.scss";
import "./styles/subscribe.scss";
import "./styles/summarizzPro.scss";

import "./styles/global.scss";
import "./styles/background.scss";
import "./styles/colors.scss";

import "./styles/toast-notification.scss";

import NotFound from "./pages/error/404";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Background />
        <NavbarWrapper />

        {/* ROUTER */}
        <Routes>
          {/* HOME/FEED */}
          <Route path='/' element={<Feed />} />

          {/* AUTHENTICATION */}
          <Route path='/authentication/login' element={<Login />} />
          <Route path='/authentication/register' element={<Register />} />
          <Route
            path='/authentication/reset-password'
            element={<ResetPassword />}
          />
          <Route path='/auth/callback' element={<CallbackAuthentication />} />
          <Route path='/auth/popup-callback' element={<PopupCallback />} />

          {/* PROFILE */}
          <Route path='/profile/:id' element={<Profile />} />
          <Route path='/profile/manage' element={<ManageProfile />} />

          {/* CONTACT */}
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />

          {/* LEGAL */}
          <Route path='/legal/terms-of-service' element={<TermsOfService />} />
          <Route path='/legal/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/legal/cookie-policy' element={<CookiePolicy />} />
          <Route path='/legal/ai-disclaimer' element={<AIDisclaimer />} />
          <Route path='/legal/accessibility' element={<Accessibility />} />

          {/* CONTENT */}
          <Route path='/content/create' element={<ContentEditor isEditMode={false} />} />
          <Route path='/content/edit/:id' element={<ContentEditor isEditMode={true} />} />
          <Route path='/content/:id' element={<ContentView />} />

          {/* PRO */}
          <Route path='/pro' element={<ProDetails />} />
          <Route path='/pro/manage' element={<ManageSubscription />} />
          <Route path='/pro/subscribe' element={<SubscribePro />} />

          {/* 404 */}
          <Route path='*' element={<NotFound />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}
