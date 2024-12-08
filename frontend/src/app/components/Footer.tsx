import "../styles/footer.scss";
import Image from "next/image";

/**
 * Footer() -> JSX.Element
 * 
 * @description
 * Renders the footer component, with the Summarizz Logo and copyright year.
 * 
 * @returns JSX.Element (Footer Component)
 */
export function Footer () {
  const year = new Date().getFullYear();

  return (
    <footer className='footer'>
      <Image src="/images/summarizz-logo.png" alt="Summarizz Logo" className='footer-logo' width={100} height={100}/>
      <p>Copyright © {year} Summarizz. All rights reserved.</p>
    </footer> 
  );
}
