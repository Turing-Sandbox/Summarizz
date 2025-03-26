"use client";

import "@/app/styles/footer.scss";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

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
  const pathname = usePathname();
  const showFooterLinks = !pathname.startsWith("/auth");

  const router = useRouter();

  return (
    <footer className='footer'>
      {showFooterLinks && (
        <div className='website-links'>
          <div className='website-links-list'>
            <h4>Legal</h4>

            <div className='link'>
              <a onClick={() => router.push("/legal/terms-of-service")}>
                Terms of Service
              </a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/legal/privacy-policy")}>
                Privacy Policy
              </a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/legal/cookie-policy")}>
                Cookie Policy
              </a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/legal/ai-disclaimer")}>
                AI Disclaimer
              </a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/legal/accessibility")}>
                Accessibility
              </a>
            </div>
          </div>

          <div className='website-links-list'>
            <h4>Social</h4>

            <div className='link'>
              <a onClick={() => router.push("/about")}>About</a>
            </div>

            <div className='link'>
              <a onClick={() => router.push("/contact")}>Contact</a>
            </div>
          </div>
        </div>
      )}
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
