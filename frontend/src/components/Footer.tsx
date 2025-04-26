import { useLocation, useNavigate } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  // This replaces usePathname from Next.js
  const pathname = location.pathname;
  const showFooterLinks = !pathname.startsWith("/auth");

  return (
    <footer className='footer'>
      {showFooterLinks && (
        <div className='website-links'>
          <div className='website-links-list'>
            <h4>Legal</h4>

            <div className='link'>
              <a onClick={() => navigate("/legal/terms-of-service")}>
                Terms of Service
              </a>
            </div>

            <div className='link'>
              <a onClick={() => navigate("/legal/privacy-policy")}>
                Privacy Policy
              </a>
            </div>

            <div className='link'>
              <a onClick={() => navigate("/legal/cookie-policy")}>
                Cookie Policy
              </a>
            </div>

            <div className='link'>
              <a onClick={() => navigate("/legal/ai-disclaimer")}>
                AI Disclaimer
              </a>
            </div>

            <div className='link'>
              <a onClick={() => navigate("/legal/accessibility")}>
                Accessibility
              </a>
            </div>
          </div>

          <div className='website-links-list'>
            <h4>Social</h4>

            <div className='link'>
              <a onClick={() => navigate("/about")}>About</a>
            </div>

            <div className='link'>
              <a onClick={() => navigate("/contact")}>Contact</a>
            </div>
          </div>
        </div>
      )}

      <img
        src='/images/summarizz-logo.png'
        alt='Summarizz Logo'
        className='footer-logo'
        width={100}
        height={100}
      />
      <p>Copyright © {year} Summarizz. All rights reserved.</p>
    </footer>
  );
}
