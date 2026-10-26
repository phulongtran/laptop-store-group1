import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Outlet, useLocation } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import Footer from './Footer';

/** F1. Layout khách hàng: Navbar + nội dung trang (<Outlet />) + Footer */
export default function MainLayout() {
  const { pathname } = useLocation();

  // Chuyển trang → cuộn lên đầu
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1 py-4">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
