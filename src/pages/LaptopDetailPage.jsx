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
  ListGroup,
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
import Price from '../components/common/Price';
import StarRating from '../components/common/StarRating';
import Loading from '../components/common/Loading';
import ErrorAlert from '../components/common/ErrorAlert';
import LaptopGrid from '../components/laptop/LaptopGrid';
import NotFoundPage from './NotFoundPage';
import { formatDate } from '../utils/format';
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
  const { add, adding } = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const { data, loading, error, refetch } = useAxios((signal) => loadDetail(id, signal), [id]);

  const laptop = data?.laptop;
  usePageTitle(laptop?.name ?? 'Chi tiết laptop');

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
            <ListGroup variant="flush">
              {data.reviews.map((review) => (
                <ListGroup.Item key={review.id} className="px-0">
                  <strong>{review.userName ?? 'Khách hàng'}</strong>{' '}
                  <small className="text-secondary">{formatDate(review.createdAt)}</small>
                  <div><StarRating value={review.rating} showValue={false} /></div>
                  <p className="mb-0">{review.comment}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
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
