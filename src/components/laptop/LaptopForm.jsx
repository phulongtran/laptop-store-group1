import { useState } from 'react';
import { Button, Col, Form, Image, Row, Spinner } from 'react-bootstrap';
import { handleImageError } from '../../utils/image';

export const RAM_CHOICES = [4, 8, 16, 32, 64];
export const STORAGE_CHOICES = [256, 512, 1024, 2048];

export const EMPTY_LAPTOP = {
  name: '',
  brandId: '',
  categoryId: '',
  price: '',
  salePrice: '',
  cpu: '',
  ram: '',
  storage: '',
  screen: '',
  gpu: '',
  weight: '',
  stock: '',
  image: '',
  description: '',
};

/** Laptop từ API → giá trị form (mọi trường là chuỗi) */
export const toFormValues = (laptop) =>
  Object.fromEntries(
    Object.keys(EMPTY_LAPTOP).map((key) => [
      key,
      laptop[key] === null || laptop[key] === undefined ? '' : String(laptop[key]),
    ])
  );

/** Giá trị form → dữ liệu gửi API: ô <input type="number"> luôn trả chuỗi nên phải đổi sang Number */
export const toPayload = (values) => ({
  name: values.name.trim(),
  brandId: Number(values.brandId),
  categoryId: Number(values.categoryId),
  price: Number(values.price),
  salePrice: values.salePrice === '' ? null : Number(values.salePrice),
  cpu: values.cpu.trim(),
  ram: Number(values.ram),
  storage: Number(values.storage),
  screen: values.screen.trim(),
  gpu: values.gpu.trim(),
  weight: values.weight === '' ? null : Number(values.weight),
  stock: Number(values.stock),
  image: values.image.trim(),
  description: values.description.trim(),
});

const isPositiveInt = (v) => v !== '' && Number.isInteger(Number(v)) && Number(v) > 0;

/** G3 + BR-10. Quy tắc kiểm tra form */
export function validateLaptop(values) {
  const errors = {};
  const name = values.name.trim();

  if (!name) errors.name = 'Vui lòng nhập tên laptop';
  else if (name.length < 5 || name.length > 100) errors.name = 'Tên phải từ 5 đến 100 ký tự';

  if (!values.brandId) errors.brandId = 'Vui lòng chọn hãng';
  if (!values.categoryId) errors.categoryId = 'Vui lòng chọn loại';

  if (!isPositiveInt(values.price)) errors.price = 'Giá phải là số nguyên lớn hơn 0';

  // BR-03: để trống hoặc 0 < salePrice < price
  if (values.salePrice !== '') {
    if (!isPositiveInt(values.salePrice)) errors.salePrice = 'Giá khuyến mãi phải là số nguyên lớn hơn 0';
    else if (!errors.price && Number(values.salePrice) >= Number(values.price))
      errors.salePrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
  }

  if (!RAM_CHOICES.includes(Number(values.ram))) errors.ram = 'Vui lòng chọn dung lượng RAM';
  if (!STORAGE_CHOICES.includes(Number(values.storage))) errors.storage = 'Vui lòng chọn dung lượng ổ cứng';

  if (values.stock === '' || !Number.isInteger(Number(values.stock)) || Number(values.stock) < 0)
    errors.stock = 'Tồn kho phải là số nguyên ≥ 0';

  if (values.weight !== '' && !(Number(values.weight) > 0)) errors.weight = 'Cân nặng phải lớn hơn 0';

  if (!values.image.trim()) errors.image = 'Vui lòng nhập link ảnh';
  else if (!values.image.trim().startsWith('http')) errors.image = 'Link ảnh phải bắt đầu bằng http';

  ['cpu', 'screen', 'gpu', 'description'].forEach((field) => {
    if (!values[field].trim()) errors[field] = 'Trường này là bắt buộc';
  });

  return errors;
}

/**
 * Form dùng chung cho thêm (POST) và sửa (PUT).
 * E5: lỗi chỉ hiện sau khi người dùng đã chạm vào ô hoặc đã bấm submit.
 */
export default function LaptopForm({ initialValues = EMPTY_LAPTOP, brands, categories, onSubmit, submitting, submitText }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validateLaptop(values);
  const showError = (field) => (touched[field] || submitted) && errors[field];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return; // kịch bản 13: còn lỗi → không gửi request
    onSubmit(toPayload(values));
  };

  /** Ô nhập có kiểm tra lỗi */
  const field = (name, label, props = {}) => (
    <Form.Group className="mb-3" controlId={`laptop-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        name={name}
        value={values[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        isInvalid={Boolean(showError(name))}
        {...props}
      />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  );

  const select = (name, label, options, placeholder) => (
    <Form.Group className="mb-3" controlId={`laptop-${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        name={name}
        value={values[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        isInvalid={Boolean(showError(name))}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Select>
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  );

  const imageOk = values.image.trim().startsWith('http');

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Row>
        <Col lg={8}>
          {field('name', 'Tên laptop *', { placeholder: 'Ví dụ: Dell XPS 13 9340' })}
          <Row>
            <Col md={6}>
              {select('brandId', 'Hãng *', brands.map((b) => ({ value: b.id, label: b.name })), '-- Chọn hãng --')}
            </Col>
            <Col md={6}>
              {select('categoryId', 'Loại *', categories.map((c) => ({ value: c.id, label: c.name })), '-- Chọn loại --')}
            </Col>
          </Row>
          <Row>
            <Col md={4}>{field('price', 'Giá gốc (VND) *', { type: 'number', min: 1, step: 1000 })}</Col>
            <Col md={4}>
              {field('salePrice', 'Giá khuyến mãi (VND)', {
                type: 'number',
                min: 1,
                step: 1000,
                placeholder: 'Để trống nếu không giảm',
              })}
            </Col>
            <Col md={4}>{field('stock', 'Tồn kho *', { type: 'number', min: 0, step: 1 })}</Col>
          </Row>
          <Row>
            <Col md={6}>{field('cpu', 'CPU *', { placeholder: 'Intel Core i7-13700H' })}</Col>
            <Col md={6}>{field('gpu', 'Card đồ họa *', { placeholder: 'NVIDIA RTX 4060 8GB' })}</Col>
          </Row>
          <Row>
            <Col md={4}>
              {select('ram', 'RAM *', RAM_CHOICES.map((r) => ({ value: r, label: `${r} GB` })), '-- RAM --')}
            </Col>
            <Col md={4}>
              {select(
                'storage',
                'Ổ cứng SSD *',
                STORAGE_CHOICES.map((s) => ({ value: s, label: s >= 1024 ? `${s / 1024} TB` : `${s} GB` })),
                '-- SSD --'
              )}
            </Col>
            <Col md={4}>{field('weight', 'Cân nặng (kg)', { type: 'number', min: 0, step: 0.01 })}</Col>
          </Row>
          {field('screen', 'Màn hình *', { placeholder: '14 inch 2.8K OLED 120Hz' })}
          {field('description', 'Mô tả *', { as: 'textarea', rows: 3 })}
        </Col>

        <Col lg={4}>
          {field('image', 'Link ảnh *', { placeholder: 'https://...' })}
          <div className="border rounded p-2 text-center bg-body-tertiary">
            {imageOk ? (
              <Image src={values.image} alt="Xem trước" fluid rounded onError={handleImageError} />
            ) : (
              <div className="py-5 text-secondary small">Ảnh xem trước</div>
            )}
          </div>
        </Col>
      </Row>

      <div className="d-flex gap-2 mt-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Spinner size="sm" className="me-2" />}
          {submitText}
        </Button>
      </div>
    </Form>
  );
}
