import { useEffect, useState } from 'react';
import { Button, Form, InputGroup, ListGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import laptopApi from '../../api/laptopApi';
import { isCancel } from '../../api/axiosClient';
import useDebounce from '../../hooks/useDebounce';
import { formatPrice, getSellingPrice } from '../../utils/format';

/**
 * D3. Ô tìm kiếm gợi ý trên Navbar
 * - Ngừng gõ 400ms mới gọi GET /laptops?q=...&_limit=5
 * - Gõ tiếp → request đang chạy bị hủy (AbortController)
 */
export default function SearchSuggest({ onNavigate }) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedKeyword = useDebounce(keyword.trim(), 400);

  useEffect(() => {
    // Từ khoá rỗng → không gọi API
    if (!debouncedKeyword) {
      setSuggestions([]);
      return undefined;
    }

    const controller = new AbortController();
    const search = async () => {
      setLoading(true);
      try {
        const { items } = await laptopApi.getAll({ q: debouncedKeyword, _limit: 5 }, controller.signal);
        setSuggestions(items);
      } catch (err) {
        if (isCancel(err)) return;
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    search();
    return () => controller.abort();
  }, [debouncedKeyword]);

  const close = () => {
    setOpen(false);
    setKeyword('');
    setSuggestions([]);
    onNavigate?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    if (!q) return;
    navigate(`/laptops?q=${encodeURIComponent(q)}`);
    close();
  };

  const goToDetail = (id) => {
    navigate(`/laptops/${id}`);
    close();
  };

  const showDropdown = open && keyword.trim() !== '';

  return (
    <Form className="position-relative my-2 my-lg-0" onSubmit={handleSubmit} role="search">
      <InputGroup>
        <Form.Control
          type="search"
          placeholder="Tìm laptop..."
          aria-label="Tìm laptop"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        />
        <Button type="submit" variant="warning">
          Tìm
        </Button>
      </InputGroup>

      {showDropdown && (
        <ListGroup className="position-absolute w-100 shadow search-suggest-list">
          {loading && (
            <ListGroup.Item className="text-secondary small">
              <Spinner size="sm" className="me-2" />
              Đang tìm...
            </ListGroup.Item>
          )}
          {!loading && debouncedKeyword && suggestions.length === 0 && (
            <ListGroup.Item className="text-secondary small">Không có kết quả</ListGroup.Item>
          )}
          {!loading &&
            suggestions.map((laptop) => (
              <ListGroup.Item
                key={laptop.id}
                action
                // onMouseDown + preventDefault: chạy trước onBlur của ô input
                onMouseDown={(e) => {
                  e.preventDefault();
                  goToDetail(laptop.id);
                }}
                className="d-flex justify-content-between gap-2"
              >
                <span className="text-truncate">{laptop.name}</span>
                <span className="text-danger fw-semibold text-nowrap">{formatPrice(getSellingPrice(laptop))}</span>
              </ListGroup.Item>
            ))}
        </ListGroup>
      )}
    </Form>
  );
}
