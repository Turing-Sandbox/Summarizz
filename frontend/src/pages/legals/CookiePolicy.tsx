import { useNavigate } from "react-router-dom";

export default function CookiePolicy() {
  const navigate = useNavigate();

  function navigateToContactPage() {
    navigate("/contact");
  }

  return (
    <div className='main-content'>
      <h1>Cookie Policy</h1>

      <p>
        <strong>Last Updated:</strong> March 25, 2025
      </p>

      <p>
        This Cookie Policy explains how Summarizz (hereinafter referred to as
        "the App"), accessible at https://summarizz.app/, uses cookies and
        similar tracking technologies to enhance your user experience. By using
        our App, you consent to the use of cookies as described in this policy.
      </p>

      <h2>1. What are Cookies?</h2>

      <p>
        Cookies are small text files that are placed on your device (computer,
        tablet, or mobile) when you visit a website or use an application. They
        are widely used to make websites and applications work, or work more
        efficiently, as well as to provide information to the owners of the site
        or app.
      </p>

      <h2>2. How We Use Cookies</h2>

      <p>Summarizz uses cookies for various purposes, including:</p>

      <ul>
        <li>
          <strong>Authentication:</strong> We use cookies to authenticate users
          who log in via OAuth. This allows us to remember your login state and
          provide a seamless user experience.
        </li>
        <li>
          <strong>Advertising:</strong> We use AdSense, which may use cookies to
          serve personalized ads based on your browsing activity. These cookies
          help AdSense and its partners to show you relevant ads.
        </li>
        <li>
          <strong>Analytics and Performance:</strong> We may use cookies to
          collect information about how users interact with our App. This helps
          us analyze and improve the App's performance and functionality.
        </li>
        <li>
          <strong>Preferences:</strong> We may use cookies to remember your
          preferences, such as language settings or display options.
        </li>
      </ul>

      <h2>3. Third-Party Cookies</h2>

      <p>
        In addition to our own cookies, we may use third-party cookies from
        services like AdSense and OAuth providers. These third parties may use
        cookies to track your online activities across different websites and
        applications.
      </p>

      <ul>
        <li>
          <strong>AdSense:</strong> Google AdSense uses cookies to deliver ads
          based on your previous visits to our App and other websites. You can
          learn more about Google's use of cookies for advertising at:{" "}
          <a href='https://policies.google.com/technologies/ads'>
            https://policies.google.com/technologies/ads
          </a>
        </li>
        <li>
          <strong>OAuth:</strong> When you log in with OAuth (e.g., Google,
          etc.), the provider sets cookies to manage the authentication process.
          Please refer to the privacy policies of the respective OAuth providers
          for more information on their cookie usage.
        </li>
      </ul>

      <h2>4. Managing Cookies</h2>

      <p>
        Most web browsers allow you to control cookies through their settings.
        You can typically choose to accept, reject, or delete cookies. However,
        please note that disabling cookies may affect the functionality of our
        App and your user experience. We are currently not displaying a cookie
        banner, but we recommend you adjust your browser settings to manage
        cookies according to your preferences.
      </p>

      <p>
        To manage cookies, you can typically find the settings in the "Options"
        or "Preferences" menu of your browser. Here are some links to cookie
        management guides for popular browsers:
      </p>

      <ul>
        <li>
          Google Chrome:{" "}
          <a href='https://support.google.com/chrome/answer/95647?hl=en'>
            https://support.google.com/chrome/answer/95647?hl=en
          </a>
        </li>
        <li>
          Mozilla Firefox:{" "}
          <a href='https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences'>
            https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences
          </a>
        </li>
        <li>
          Safari:{" "}
          <a href='https://support.apple.com/en-ca/guide/safari/sfri11471/mac'>
            https://support.apple.com/en-ca/guide/safari/sfri11471/mac
          </a>
        </li>
        <li>
          Microsoft Edge:{" "}
          <a href='https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-9474-177a-9c70-3947934dd8bb'>
            https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-9474-177a-9c70-3947934dd8bb
          </a>
        </li>
      </ul>

      <h2>5. Changes to this Cookie Policy</h2>

      <p>
        We may update this Cookie Policy from time to time to reflect changes in
        our use of cookies or for other operational, legal, or regulatory
        reasons. Any changes will be posted on this page, and your continued use
        of the App constitutes acceptance of the revised policy.
      </p>

      <h2>6. Contact Us</h2>

      <p>
        If you have any questions about our use of cookies, please contact us
        at: <a onClick={navigateToContactPage}>https://summarizz.app/contact</a>
      </p>
    </div>
  );
}
