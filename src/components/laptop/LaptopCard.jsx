import { Badge, Button, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Price from '../common/Price';
import StarRating from '../common/StarRating';
import useAddToCart from '../../hooks/useAddToCart';
import { handleImageError } from '../../utils/image';

const storageLabel = (gb) => (gb >= 1024 ? `${gb / 1024}TB` : `${gb}GB`);

/** E2. Thẻ sản phẩm */
export default function LaptopCard({ laptop }) {
  const { add, adding } = useAddToCart();
  const outOfStock = laptop.stock <= 0; // BR-01
  const detailUrl = `/laptops/${laptop.id}`;

  return (
    <Card className="h-100 shadow-sm laptop-card">
      <Link to={detailUrl} className="position-relative">
        <Card.Img
          variant="top"
          src={laptop.image}
          alt={laptop.name}
          className="laptop-card-img"
          onError={handleImageError}
        />
        {outOfStock && (
          <Badge bg="secondary" className="position-absolute top-0 start-0 m-2">
            Hết hàng
          </Badge>
        )}
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h6" className="line-clamp-2" title={laptop.name}>
          <Link to={detailUrl} className="text-decoration-none text-body">
            {laptop.name}
          </Link>
        </Card.Title>

        <div className="d-flex flex-wrap gap-1 mb-2">
          <Badge bg="light" text="dark" className="border">
            {laptop.cpu}
          </Badge>
          <Badge bg="light" text="dark" className="border">
            RAM {laptop.ram}GB
          </Badge>
          <Badge bg="light" text="dark" className="border">
            SSD {storageLabel(laptop.storage)}
          </Badge>
        </div>

        <StarRating value={laptop.rating} />

        <div className="mt-auto pt-2">
          <Price laptop={laptop} />
          <Button
            variant={outOfStock ? 'secondary' : 'primary'}
            className="w-100 mt-2"
            disabled={outOfStock || adding}
            onClick={() => add(laptop)}
          >
            {adding && <Spinner size="sm" className="me-2" />}
            {outOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
