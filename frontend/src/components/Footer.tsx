import "@/app/styles/footer.scss";
import Image from "next/image";

/**
 * Footer() -> JSX.Element
 *
 * @description
 * Renders the footer component, with the Summarizz Logo and copyright year.
 *
 * @returns JSX.Element (Footer Component)
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className='footer'>
      <div className='website-links'>
        <div className='website-links-list'>
          <h4>Legal</h4>

          <div className='link'>
            <a href='/legal/terms-of-service'>Terms of Service</a>
          </div>

          <div className='link'>
            <a href='/legal/privacy-policy'>Privacy Policy</a>
          </div>

          <div className='link'>
            <a href='/legal/cookie-policy'>Cookie Policy</a>
          </div>

          <div className='link'>
            <a href='/legal/ai-disclaimer'>AI Disclaimer</a>
          </div>

          <div className='link'>
            <a href='/legal/accessibility'>Accessibility</a>
          </div>
        </div>

        <div className='website-links-list'>
          <h4>Social</h4>

          <div className='link'>
            <a href='/about'>About</a>
          </div>

          <div className='link'>
            <a href='/contact'>Contact</a>
          </div>
        </div>
      </div>

      <Image
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
