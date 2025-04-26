import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const location = useLocation();
  const pathname = location.pathname;
  const showNavbar = !pathname.startsWith("/auth");

  if (!showNavbar) return null;

  return <Navbar />;
}
