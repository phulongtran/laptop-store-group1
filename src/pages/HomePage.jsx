import { Link } from 'react-router-dom';
import laptopApi from '../api/laptopApi';
import catalogApi from '../api/catalogApi';
import useAxios from '../hooks/useAxios';
import usePageTitle from '../hooks/usePageTitle';
import LaptopGrid from '../components/laptop/LaptopGrid';
import ErrorAlert from '../components/common/ErrorAlert';

const NEWEST_PARAMS = { _sort: 'createdAt', _order: 'desc', _limit: 8 };
const BESTSELLER_PARAMS = { _sort: 'sold', _order: 'desc', _limit: 4 };

/** C1. Gọi SONG SONG 4 request bằng Promise.all – thiếu 1 phần thì trang chủ không đủ dữ liệu */
async function loadParallel(signal) {
  const start = performance.now();
  const [newest, bestsellers, brands, categories] = await Promise.all([
    laptopApi.getAll(NEWEST_PARAMS, signal),
    laptopApi.getAll(BESTSELLER_PARAMS, signal),
    catalogApi.getBrands(signal),
    catalogApi.getCategories(signal),
  ]);
  return {
    newest: newest.items,
    bestsellers: bestsellers.items,
    brands,
    categories,
    parallelMs: Math.round(performance.now() - start),
  };
}

export default function HomePage() {
  usePageTitle('Trang chủ');
  const { data, loading, error, refetch } = useAxios(loadParallel, []);

  return (
    <>
      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {!error && (
        <>
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">🔥 Bán chạy</h4>
              <Link to="/laptops?sort=bestseller">Xem tất cả →</Link>
            </div>
            <LaptopGrid laptops={data?.bestsellers} loading={loading} skeletonCount={4} />
          </section>

          <section>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">🆕 Mới về</h4>
              <Link to="/laptops">Xem tất cả →</Link>
            </div>
            <LaptopGrid laptops={data?.newest} loading={loading} skeletonCount={8} />
          </section>
        </>
      )}
    </>
  );
}
