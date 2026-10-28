import { useRef, useState } from 'react';
import { Alert, Button, Card, Col, Form, ListGroup, Row, Spinner } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import laptopApi from '../api/laptopApi';
import orderApi from '../api/orderApi';
import cartApi from '../api/cartApi';
import { getErrorMessage } from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import usePageTitle from '../hooks/usePageTitle';
import { formatPrice, getSellingPrice } from '../utils/format';
import Loading from '../components/common/Loading';

/** BR-08 */
const validate = ({ fullName, phone, address }) => {
  const errors = {};
  if (fullName.trim().length < 2) errors.fullName = 'Vui lòng nhập họ tên';
  if (!/^0\d{9}$/.test(phone.trim())) errors.phone = 'Số điện thoại gồm 10 số và bắt đầu bằng 0';
  if (address.trim().length < 10) errors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
  return errors;
};

export default function CheckoutPage() {
  usePageTitle('Thanh toán');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, loading, clearLocal } = useCart();
  const placedRef = useRef(false);

  const [form, setForm] = useState({ fullName: user.fullName ?? '', phone: '', address: '', note: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const errors = validate(form);
  const showError = (field) => (touched[field] || submitted) && errors[field];

  if (loading && items.length === 0) return <Loading text="Đang tải giỏ hàng..." />;
  // BR-09: giỏ rỗng → không cho vào trang thanh toán
  if (!placedRef.current && items.length === 0) return <Navigate to="/cart" replace />;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  /** C4 + BR-04. Quy trình đặt hàng */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setPlacing(true);
    setError(null);
    try {
      // Bước 1 – Kiểm tra tồn kho MỚI NHẤT bằng Promise.all:
      // thiếu thông tin của bất kỳ laptop nào thì không thể đặt hàng → dừng toàn bộ.
      const latest = await Promise.all(items.map((item) => laptopApi.getById(item.laptopId)));
      const shortageIndex = items.findIndex((item, i) => latest[i].stock < item.quantity);
      if (shortageIndex >= 0) {
        const lp = latest[shortageIndex];
        throw { message: `"${lp.name}" chỉ còn ${lp.stock} sản phẩm` };
      }

      // Bước 2 – Tạo đơn hàng (giá và tổng tiền tính lại theo dữ liệu mới nhất)
      const orderItems = items.map((item, i) => ({
        laptopId: item.laptopId,
        name: latest[i].name,
        price: getSellingPrice(latest[i]),
        quantity: item.quantity,
      }));
      const order = await orderApi.create({
        userId: user.id,
        items: orderItems,
        customer: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          note: form.note.trim(),
        },
        total: orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // Bước 3 – Trừ kho + làm rỗng giỏ bằng Promise.allSettled:
      // đơn đã tạo xong, một request phụ lỗi cũng không được làm hỏng kết quả đặt hàng.
      const results = await Promise.allSettled([
        ...items.map((item, i) =>
          laptopApi.patch(item.laptopId, {
            stock: latest[i].stock - item.quantity,
            sold: latest[i].sold + item.quantity,
          })
        ),
        ...items.map((item) => cartApi.remove(item.id)),
      ]);

      // Bước 4 – Có request thất bại: vẫn coi là thành công, chỉ ghi cảnh báo
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        console.warn('[Checkout] Một số request cập nhật kho/giỏ hàng thất bại:', failed.map((f) => f.reason));
      }

      // Bước 5 – Chuyển trang kèm thông báo
      placedRef.current = true;
      navigate('/orders', { state: { message: `Đặt hàng thành công! Mã đơn #${order.id}` } });
      clearLocal();
    } catch (err) {
      setError(getErrorMessage(err));
      setPlacing(false);
    }
  };

  return (
    <>
      <h3 className="fw-bold mb-3">Thanh toán</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Header className="fw-semibold">Thông tin nhận hàng</Card.Header>
            <Card.Body>
              <Form noValidate onSubmit={handleSubmit} id="checkout-form">
                <Form.Group className="mb-3" controlId="checkout-fullName">
                  <Form.Label>Họ tên *</Form.Label>
                  <Form.Control
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={Boolean(showError('fullName'))}
                  />
                  <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="checkout-phone">
                  <Form.Label>Số điện thoại *</Form.Label>
                  <Form.Control
                    name="phone"
                    type="tel"
                    placeholder="0901234567"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={Boolean(showError('phone'))}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="checkout-address">
                  <Form.Label>Địa chỉ giao hàng *</Form.Label>
                  <Form.Control
                    name="address"
                    as="textarea"
                    rows={2}
                    value={form.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={Boolean(showError('address'))}
                  />
                  <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="checkout-note">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control name="note" as="textarea" rows={2} value={form.note} onChange={handleChange} />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Header className="fw-semibold">Đơn hàng ({items.length} sản phẩm)</Card.Header>
            <ListGroup variant="flush">
              {items.map((item) => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between gap-2">
                  <span>
                    {item.laptop.name} <span className="text-secondary">× {item.quantity}</span>
                  </span>
                  <span className="text-nowrap">{formatPrice(getSellingPrice(item.laptop) * item.quantity)}</span>
                </ListGroup.Item>
              ))}
              <ListGroup.Item className="d-flex justify-content-between fw-bold">
                <span>Tổng cộng</span>
                <span className="text-danger fs-5">{formatPrice(totalPrice)}</span>
              </ListGroup.Item>
            </ListGroup>
            <Card.Body className="d-grid gap-2">
              <Button type="submit" form="checkout-form" size="lg" disabled={placing}>
                {placing && <Spinner size="sm" className="me-2" />}
                Đặt hàng
              </Button>
              <Button as={Link} to="/cart" variant="outline-secondary">
                ← Quay lại giỏ hàng
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
