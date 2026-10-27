import { Col, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import laptopApi, { buildLaptopParams } from '../api/laptopApi';
import catalogApi from '../api/catalogApi';
import useAxios from '../hooks/useAxios';
import usePageTitle from '../hooks/usePageTitle';
import LaptopFilter from '../components/laptop/LaptopFilter';
import LaptopGrid from '../components/laptop/LaptopGrid';
import ErrorAlert from '../components/common/ErrorAlert';

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

  const queryString = searchParams.toString();
  const { data, loading, error, refetch } = useAxios(
    (signal) => laptopApi.getAll(buildLaptopParams(filters), signal),
    [queryString]
  );

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h3 className="fw-bold mb-0">Laptop</h3>
        {data && <span className="text-secondary">Tìm thấy {data.total} laptop</span>}
      </div>

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
          {error ? (
            <ErrorAlert message={error} onRetry={refetch} />
          ) : (
            <LaptopGrid laptops={data?.items} loading={loading} cols={{ xs: 1, sm: 2, md: 3 }} />
          )}
        </Col>
      </Row>
    </>
  );
}
