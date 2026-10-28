import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="bg-dark text-white-50 py-4 mt-auto">
      <Container className="d-flex flex-column flex-md-row justify-content-between gap-2 small">
        <span>© 2026 LaptopStore – Exercise 27 mở rộng (FER202)</span>
        <span>React · axios · react-bootstrap · React Router · json-server</span>
      </Container>
    </footer>
  );
}
