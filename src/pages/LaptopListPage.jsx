import { Col, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import catalogApi from '../api/catalogApi';
import useAxios from '../hooks/useAxios';
import usePageTitle from '../hooks/usePageTitle';
import LaptopFilter from '../components/laptop/LaptopFilter';

const FILTER_KEYS = ['brandId', 'categoryId', 'priceMin', 'priceMax', 'ramMin', 'sort', 'q', 'page'];

export default function LaptopListPage() {
  usePageTitle('Danh sách laptop');
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? '']));

  const updateParams = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const catalog = useAxios(async (signal) => {
    const [brands, categories] = await Promise.all([catalogApi.getBrands(signal), catalogApi.getCategories(signal)]);
    return { brands, categories };
  }, []);

  return (
    <Row>
      <Col lg={3}>
        <div className="bg-body-tertiary rounded p-3 sticky-lg-top filter-sticky">
          <LaptopFilter
            brands={catalog.data?.brands}
            categories={catalog.data?.categories}
            filters={filters}
            onChange={(patch) => updateParams(patch)}
            onReset={() => setSearchParams({})}
            idPrefix="side"
          />
        </div>
      </Col>
      <Col lg={9}>
        <h3 className="fw-bold mb-3">Laptop</h3>
      </Col>
    </Row>
  );
}
