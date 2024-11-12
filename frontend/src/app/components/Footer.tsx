export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className='footer'>
      <p>&copy; {year} Summarizz</p>
    </footer>
  );
}
