import { useState } from 'react';
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Col,
  Form,
  Image,
  InputGroup,
  Row,
  Spinner,
  Tab,
  Table,
  Tabs,
} from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import laptopApi from '../api/laptopApi';
import reviewApi from '../api/reviewApi';
import { getErrorMessage } from '../api/axiosClient';
import useAxios from '../hooks/useAxios';
import useAddToCart from '../hooks/useAddToCart';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Price from '../components/common/Price';
import StarRating from '../components/common/StarRating';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import LaptopGrid from '../components/laptop/LaptopGrid';
import ReviewList from '../components/laptop/ReviewList';
import ReviewForm from '../components/laptop/ReviewForm';
import NotFoundPage from './NotFoundPage';
import { handleImageError } from '../utils/image';

/**
 * C3 + D2. Tải trang chi tiết
 * Bước 1: GET laptop (bắt buộc) – lỗi thì cả trang báo lỗi
 * Bước 2: Promise.allSettled [đánh giá, laptop liên quan] – phần nào lỗi chỉ ảnh hưởng phần đó
 * Cả 2 bước dùng CHUNG một signal → đổi id là hủy hết request của laptop cũ
 */
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

const storageLabel = (gb) => (gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`);

export default function LaptopDetailPage() {
  const { id } = useParams();

  // F7. /laptops/abc (id không phải số) → trang 404, không gọi API
  if (!/^\d+$/.test(id)) return <NotFoundPage />;

  // key={id}: đổi laptop → component mới, state (số lượng...) về mặc định
  return <LaptopDetail key={id} id={id} />;
}

function LaptopDetail({ id }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { add, adding } = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { data, loading, error, refetch, setData } = useAxios((signal) => loadDetail(id, signal), [id]);

  const laptop = data?.laptop;
  usePageTitle(laptop?.name ?? 'Chi tiết laptop');

  /** G2 + BR-07. Gửi đánh giá – mỗi user chỉ đánh giá 1 lần / 1 laptop */
  const handleReview = async ({ rating, comment }) => {
    setSubmittingReview(true);
    try {
      const existing = await reviewApi.findByUser(laptop.id, user.id);
      if (existing) {
        showToast('Bạn đã đánh giá sản phẩm này rồi', 'warning');
        return false;
      }
      const review = await reviewApi.create({
        laptopId: laptop.id,
        userId: user.id,
        userName: user.fullName,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      });
      // Cập nhật điểm trung bình của laptop (PATCH 1 trường)
      const reviews = [review, ...data.reviews];
      const avg = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
      await laptopApi.patch(laptop.id, { rating: avg });

      // Thêm vào ĐẦU danh sách bằng setData – không cần tải lại trang
      setData((prev) => ({ ...prev, reviews, laptop: { ...prev.laptop, rating: avg } }));
      showToast('Cảm ơn bạn đã đánh giá!');
      return true;
    } catch (err) {
      showToast(getErrorMessage(err), 'danger');
      return false;
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loading text="Đang tải thông tin laptop..." />;
  if (error)
    return (
      <>
        <ErrorAlert message={error} onRetry={refetch} />
        <Button variant="link" onClick={() => navigate('/laptops')}>
          ← Về danh sách laptop
        </Button>
      </>
    );

  const outOfStock = laptop.stock <= 0;
  const alreadyReviewed = user && data.reviews.some((r) => r.userId === user.id);

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/laptops' }}>
          Laptop
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{laptop.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="g-4 mb-4">
        <Col md={5}>
          <Image src={laptop.image} alt={laptop.name} fluid rounded className="border w-100" onError={handleImageError} />
        </Col>
        <Col md={7}>
          <h2 className="fw-bold">{laptop.name}</h2>
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            {laptop.brand && (
              <Badge as={Link} to={`/laptops?brandId=${laptop.brandId}`} bg="dark" className="text-decoration-none">
                {laptop.brand.name}
              </Badge>
            )}
            {laptop.category && (
              <Badge as={Link} to={`/laptops?categoryId=${laptop.categoryId}`} bg="primary" className="text-decoration-none">
                {laptop.category.name}
              </Badge>
            )}
            <StarRating value={laptop.rating} />
            <span className="text-secondary small">· Đã bán {laptop.sold}</span>
          </div>

          <div className="my-3">
            <Price laptop={laptop} size="lg" />
          </div>

          <p>{laptop.description}</p>
          <p className="mb-3">
            Tình trạng:{' '}
            {outOfStock ? <Badge bg="secondary">Hết hàng</Badge> : <Badge bg="success">Còn {laptop.stock} sản phẩm</Badge>}
          </p>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <InputGroup style={{ width: 140 }}>
              <Button
                variant="outline-secondary"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={outOfStock || quantity <= 1}
              >
                −
              </Button>
              <Form.Control value={quantity} readOnly className="text-center" aria-label="Số lượng" />
              <Button
                variant="outline-secondary"
                onClick={() => setQuantity((q) => Math.min(laptop.stock, q + 1))}
                disabled={outOfStock || quantity >= laptop.stock}
              >
                +
              </Button>
            </InputGroup>

            <Button size="lg" disabled={outOfStock || adding} onClick={() => add(laptop, quantity)}>
              {adding && <Spinner size="sm" className="me-2" />}
              🛒 Thêm vào giỏ
            </Button>
            <Button variant="outline-secondary" size="lg" onClick={() => navigate(-1)}>
              ← Quay lại
            </Button>
          </div>
        </Col>
      </Row>

      <Tabs defaultActiveKey="specs" className="mb-3" id="laptop-tabs">
        <Tab eventKey="specs" title="Thông số kỹ thuật">
          <Table striped bordered responsive>
            <tbody>
              <tr><th style={{ width: 200 }}>CPU</th><td>{laptop.cpu}</td></tr>
              <tr><th>RAM</th><td>{laptop.ram} GB</td></tr>
              <tr><th>Ổ cứng</th><td>SSD {storageLabel(laptop.storage)}</td></tr>
              <tr><th>Màn hình</th><td>{laptop.screen}</td></tr>
              <tr><th>Card đồ họa</th><td>{laptop.gpu}</td></tr>
              <tr><th>Cân nặng</th><td>{laptop.weight ? `${laptop.weight} kg` : '—'}</td></tr>
              <tr><th>Hãng</th><td>{laptop.brand?.name}</td></tr>
              <tr><th>Loại</th><td>{laptop.category?.name}</td></tr>
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="reviews" title={`Đánh giá (${data.reviews.length})`}>
          {data.reviewsError ? (
            <Alert variant="warning">Không tải được đánh giá. {data.reviewsError}</Alert>
          ) : (
            <>
              {!user && (
                <Alert variant="light" className="border">
                  <Link to="/login" state={{ from: { pathname: `/laptops/${laptop.id}` } }}>
                    Đăng nhập
                  </Link>{' '}
                  để viết đánh giá.
                </Alert>
              )}

              {user && !alreadyReviewed && <ReviewForm onSubmit={handleReview} submitting={submittingReview} />}

              {alreadyReviewed && <Alert variant="success">Bạn đã đánh giá sản phẩm này.</Alert>}

              <ReviewList reviews={data.reviews} />
            </>
          )}
        </Tab>
      </Tabs>

      <section className="mt-5">
        <h4 className="fw-bold mb-3">Laptop cùng loại</h4>
        {data.relatedError ? (
          <Alert variant="warning">Không tải được laptop liên quan.</Alert>
        ) : (
          <LaptopGrid laptops={data.related} loading={false} />
        )}
      </section>
    </>
  );
}
