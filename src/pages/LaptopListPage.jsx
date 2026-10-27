import { useEffect, useState } from 'react';
import { Button, Col, Form, InputGroup, Offcanvas, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import laptopApi, { buildLaptopParams, PAGE_SIZE, SORT_OPTIONS } from '../api/laptopApi';
import catalogApi from '../api/catalogApi';
import useAxios from '../hooks/useAxios';
import useDebounce from '../hooks/useDebounce';
import usePageTitle from '../hooks/usePageTitle';
import LaptopFilter from '../components/laptop/LaptopFilter';
import LaptopGrid from '../components/laptop/LaptopGrid';
import AppPagination from '../components/common/AppPagination';
import ErrorAlert from '../components/common/ErrorAlert';

const FILTER_KEYS = ['brandId', 'categoryId', 'priceMin', 'priceMax', 'ramMin', 'sort', 'q', 'page'];

/**
 * F3. Toàn bộ trạng thái lọc nằm trên URL:
 * /laptops?brandId=3&categoryId=2&priceMin=...&priceMax=...&ramMin=16&sort=price_asc&q=rog&page=2
 * → F5 / gửi link / nút Back đều cho đúng kết quả.
 */
export default function LaptopListPage() {
  usePageTitle('Danh sách laptop');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);

  // Đọc bộ lọc từ URL
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? '']));
  const page = Number(filters.page) || 1;
  const sort = SORT_OPTIONS[filters.sort] ? filters.sort : 'newest';

  /** Ghi URL. Đổi bộ lọc bất kỳ → quay về trang 1 */
  const updateParams = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
    setShowFilter(false);
  };

  // Hãng + loại cho bộ lọc (song song)
  const catalog = useAxios(async (signal) => {
    const [brands, categories] = await Promise.all([catalogApi.getBrands(signal), catalogApi.getCategories(signal)]);
    return { brands, categories };
  }, []);

  // D1. Query string đổi → useAxios hủy request cũ, gọi request mới
  const queryString = searchParams.toString();
  const { data, loading, error, refetch } = useAxios(
    (signal) => laptopApi.getAll(buildLaptopParams({ ...filters, sort }), signal),
    [queryString]
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  // H2. Ô tìm kiếm trên trang: ngừng gõ 500ms mới đưa q lên URL
  const [keyword, setKeyword] = useState(filters.q);
  const debouncedKeyword = useDebounce(keyword.trim(), 500);

  // URL đổi từ nơi khác (ô tìm kiếm Navbar, nút Back) → đồng bộ ô nhập
  useEffect(() => {
    setKeyword(filters.q);
  }, [filters.q]);

  useEffect(() => {
    if (debouncedKeyword !== filters.q) updateParams({ q: debouncedKeyword });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  const filterProps = {
    brands: catalog.data?.brands,
    categories: catalog.data?.categories,
    filters,
    onChange: (patch) => updateParams(patch),
    onReset: () => {
      setKeyword('');
      setSearchParams({});
      setShowFilter(false);
    },
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h3 className="fw-bold mb-0">Laptop</h3>
        {data && <span className="text-secondary">Tìm thấy {data.total} laptop</span>}
      </div>

      <Row>
        {/* E3. Màn hình ≥ lg: bộ lọc ở cột trái */}
        <Col lg={3} className="d-none d-lg-block">
          <div className="bg-body-tertiary rounded p-3 sticky-lg-top filter-sticky">
            <LaptopFilter {...filterProps} idPrefix="side" />
          </div>
        </Col>

        <Col lg={9}>
          <Row className="g-2 mb-3">
            <Col xs={12} md>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="Tìm theo tên, CPU, card đồ họa..."
                  aria-label="Tìm trong danh sách"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={6} md="auto">
              <Form.Select
                aria-label="Sắp xếp"
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value })}
              >
                {Object.entries(SORT_OPTIONS).map(([value, option]) => (
                  <option key={value} value={value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md="auto" className="d-lg-none">
              <Button variant="outline-dark" className="w-100" onClick={() => setShowFilter(true)}>
                ⚙ Bộ lọc
              </Button>
            </Col>
          </Row>

          {error ? (
            <ErrorAlert message={error} onRetry={refetch} />
          ) : (
            <LaptopGrid laptops={data?.items} loading={loading} cols={{ xs: 1, sm: 2, md: 3 }} />
          )}

          {!loading && !error && (
            <AppPagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => updateParams({ page: p === 1 ? '' : p }, { resetPage: false })}
            />
          )}
        </Col>
      </Row>

      {/* E3. Mobile: bộ lọc trong Offcanvas */}
      <Offcanvas show={showFilter} onHide={() => setShowFilter(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Bộ lọc</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <LaptopFilter {...filterProps} idPrefix="mobile" />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
