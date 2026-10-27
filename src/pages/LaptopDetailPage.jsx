import { useNavigate, useParams } from 'react-router-dom';
import laptopApi from '../api/laptopApi';
import reviewApi from '../api/reviewApi';
import { getErrorMessage } from '../api/axiosClient';
import useAxios from '../hooks/useAxios';
import usePageTitle from '../hooks/usePageTitle';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import NotFoundPage from './NotFoundPage';

async function loadDetail(id, signal) {
  const laptop = await laptopApi.getById(id, signal);
  const [reviewsResult, relatedResult] = await Promise.allSettled([
    reviewApi.getByLaptop(id, signal),
    laptopApi.getRelated(laptop, signal),
  ]);
  return {
    laptop,
    reviews: reviewsResult.status === 'fulfilled' ? reviewsResult.value : [],
    reviewsError: reviewsResult.status === 'rejected' ? getErrorMessage(reviewsResult.reason) : null,
    related: relatedResult.status === 'fulfilled' ? relatedResult.value : [],
    relatedError: relatedResult.status === 'rejected' ? getErrorMessage(relatedResult.reason) : null,
  };
}

export default function LaptopDetailPage() {
  const { id } = useParams();

  if (!/^\d+$/.test(id)) return <NotFoundPage />;

  return <LaptopDetail key={id} id={id} />;
}

function LaptopDetail({ id }) {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAxios((signal) => loadDetail(id, signal), [id]);
  const laptop = data?.laptop;
  usePageTitle(laptop?.name ?? 'Chi tiết laptop');

  if (loading) return <Loading text="Đang tải thông tin laptop..." />;
  if (error)
    return (
      <>
        <ErrorAlert message={error} onRetry={refetch} />
        <button type="button" className="btn btn-link" onClick={() => navigate('/laptops')}>
          ← Về danh sách laptop
        </button>
      </>
    );

  return (
    <div>
      <h2>{laptop?.name}</h2>
      <p>{laptop?.description}</p>
    </div>
  );
}
