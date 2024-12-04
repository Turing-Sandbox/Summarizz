import "../styles/footer.scss";

export function Footer () {
  const year = new Date().getFullYear();

  return (
    <footer className='footer'>
      <img src="/images/summarizz-logo.png" alt="Summarizz Logo" className='footer-logo'/>
      <p>Copyright © {year} Summarizz. All rights reserved.</p>
    </footer> 
  );
}
