import { useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../api/axiosClient';
import usePageTitle from '../hooks/usePageTitle';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@laptopstore.vn', password: '123456' },
  { label: 'Khách hàng', email: 'khach@laptopstore.vn', password: '123456' },
];

const validate = ({ email, password }) => {
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Email không hợp lệ';
  if (password.length < 6) errors.password = 'Mật khẩu có ít nhất 6 ký tự';
  return errors;
};

export default function LoginPage() {
  usePageTitle('Đăng nhập');
  const { user, login } = useAuth();
  const location = useLocation();
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // Vừa đăng nhập xong thì gửi lời chào; vào lại /login khi đã đăng nhập thì không
  const justLoggedIn = useRef(false);

  // BR-09: đã đăng nhập → chuyển về trang trước đó (hoặc "/")
  if (user) {
    const state = justLoggedIn.current ? { message: `Xin chào, ${user.fullName}!` } : undefined;
    return <Navigate to={redirectTo} replace state={state} />;
  }

  const errors = validate(form);
  // E5: chỉ hiện lỗi sau khi đã chạm vào ô hoặc bấm submit
  const showError = (field) => (touched[field] || submitted) && errors[field];

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setError(null);
    try {
      justLoggedIn.current = true;
      await login(form.email.trim(), form.password);
    } catch (err) {
      justLoggedIn.current = false;
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col sm={10} md={7} lg={5}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <h3 className="fw-bold text-center mb-3">Đăng nhập</h3>

            {from && !error && (
              <Alert variant="info" className="small">
                Vui lòng đăng nhập để tiếp tục.
              </Alert>
            )}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="login-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('email'))}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="login-password">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('password'))}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>
              <Button type="submit" className="w-100" size="lg" disabled={submitting}>
                {submitting && <Spinner size="sm" className="me-2" />}
                Đăng nhập
              </Button>
            </Form>

            <hr />
            <p className="small text-secondary mb-2">Tài khoản demo (mật khẩu 123456):</p>
            <div className="d-flex gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <Button
                  key={acc.email}
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setForm({ email: acc.email, password: acc.password })}
                >
                  {acc.label}
                </Button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
