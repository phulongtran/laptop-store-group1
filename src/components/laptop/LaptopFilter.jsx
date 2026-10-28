import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

const RAM_OPTIONS = [8, 16, 32];

/**
 * E3. Bộ lọc dạng controlled: KHÔNG tự đọc URL.
 *   filters  – giá trị hiện tại (chuỗi), ví dụ { brandId: '3', ramMin: '16', priceMin: '' }
 *   onChange – gọi với phần thay đổi, ví dụ onChange({ brandId: '3' })
 *   onReset  – xoá toàn bộ bộ lọc
 * Khoảng giá dùng state cục bộ + nút "Áp dụng" để không gọi API mỗi lần gõ.
 * idPrefix: trang danh sách render 2 bộ lọc (cột trái + Offcanvas) → id không được trùng.
 */
export default function LaptopFilter({ brands = [], categories = [], filters, onChange, onReset, idPrefix = 'f' }) {
  const [priceMin, setPriceMin] = useState(filters.priceMin ?? '');
  const [priceMax, setPriceMax] = useState(filters.priceMax ?? '');

  // URL đổi (nút Back / Xoá bộ lọc) → đồng bộ lại ô nhập
  useEffect(() => {
    setPriceMin(filters.priceMin ?? '');
    setPriceMax(filters.priceMax ?? '');
  }, [filters.priceMin, filters.priceMax]);

  const priceInvalid = priceMin !== '' && priceMax !== '' && Number(priceMin) > Number(priceMax);

  const applyPrice = (e) => {
    e.preventDefault();
    if (!priceInvalid) onChange({ priceMin, priceMax });
  };

  return (
    <div className="laptop-filter">
      <h6 className="fw-bold">Hãng</h6>
      <Form.Check
        type="radio"
        id={`${idPrefix}-brand-all`}
        name={`${idPrefix}-brand`}
        label="Tất cả"
        checked={!filters.brandId}
        onChange={() => onChange({ brandId: '' })}
      />
      {brands.map((b) => (
        <Form.Check
          key={b.id}
          type="radio"
          id={`${idPrefix}-brand-${b.id}`}
          name={`${idPrefix}-brand`}
          label={b.name}
          checked={filters.brandId === String(b.id)}
          onChange={() => onChange({ brandId: String(b.id) })}
        />
      ))}

      <hr />
      <h6 className="fw-bold">Loại laptop</h6>
      <Form.Check
        type="radio"
        id={`${idPrefix}-cat-all`}
        name={`${idPrefix}-category`}
        label="Tất cả"
        checked={!filters.categoryId}
        onChange={() => onChange({ categoryId: '' })}
      />
      {categories.map((c) => (
        <Form.Check
          key={c.id}
          type="radio"
          id={`${idPrefix}-cat-${c.id}`}
          name={`${idPrefix}-category`}
          label={c.name}
          checked={filters.categoryId === String(c.id)}
          onChange={() => onChange({ categoryId: String(c.id) })}
        />
      ))}

      <hr />
      <h6 className="fw-bold">Khoảng giá (VND)</h6>
      <Form onSubmit={applyPrice}>
        <InputGroup size="sm" className="mb-2">
          <InputGroup.Text>Từ</InputGroup.Text>
          <Form.Control
            type="number"
            min={0}
            step={1000000}
            placeholder="0"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            isInvalid={priceInvalid}
          />
        </InputGroup>
        <InputGroup size="sm" className="mb-2" hasValidation>
          <InputGroup.Text>Đến</InputGroup.Text>
          <Form.Control
            type="number"
            min={0}
            step={1000000}
            placeholder="100000000"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            isInvalid={priceInvalid}
          />
          <Form.Control.Feedback type="invalid">Giá "từ" phải nhỏ hơn giá "đến"</Form.Control.Feedback>
        </InputGroup>
        <Button type="submit" size="sm" variant="outline-primary" className="w-100" disabled={priceInvalid}>
          Áp dụng
        </Button>
      </Form>

      <hr />
      <h6 className="fw-bold">RAM tối thiểu</h6>
      <Form.Select
        size="sm"
        aria-label="RAM tối thiểu"
        value={filters.ramMin ?? ''}
        onChange={(e) => onChange({ ramMin: e.target.value })}
      >
        <option value="">Không yêu cầu</option>
        {RAM_OPTIONS.map((r) => (
          <option key={r} value={r}>
            Từ {r}GB
          </option>
        ))}
      </Form.Select>

      <Button variant="outline-secondary" size="sm" className="w-100 mt-4" onClick={onReset}>
        Xóa bộ lọc
      </Button>
    </div>
  );
}
