import { Col, Container, Nav, Row } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

/** F1. Layout quản trị: Navbar + sidebar (NavLink) + <Outlet /> */
export default function AdminLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <Container fluid className="flex-grow-1 py-4">
        <Row>
          <Col md={3} lg={2} className="mb-3">
            <div className="bg-body-tertiary rounded p-2">
              <div className="text-uppercase small fw-bold text-secondary px-2 py-1">Quản trị</div>
              <Nav variant="pills" className="flex-column">
                <Nav.Link as={NavLink} to="/admin/laptops">
                  💻 Laptop
                </Nav.Link>
                <Nav.Link as={NavLink} to="/admin/orders">
                  📦 Đơn hàng
                </Nav.Link>
                <hr className="my-2" />
                <Nav.Link as={NavLink} to="/" end>
                  ← Về cửa hàng
                </Nav.Link>
              </Nav>
            </div>
          </Col>
          <Col md={9} lg={10}>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
