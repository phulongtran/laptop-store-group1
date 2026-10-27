import { Badge } from 'react-bootstrap';
import { formatPrice, getDiscountPercent, hasSale } from '../../utils/format';

/**
 * E2 + BR-03. Hiển thị giá:
 * - Có giảm giá: giá sale đỏ đậm + giá gốc gạch ngang + Badge "-x%"
 * - Không giảm: giá gốc
 */
export default function Price({ laptop, size = 'md' }) {
  const mainClass = size === 'lg' ? 'fs-3' : 'fs-5';

  if (!hasSale(laptop)) {
    return <div className={`fw-bold text-danger ${mainClass}`}>{formatPrice(laptop.price)}</div>;
  }

  return (
    <div>
      <span className={`fw-bold text-danger ${mainClass} me-2`}>{formatPrice(laptop.salePrice)}</span>
      <Badge bg="danger">-{getDiscountPercent(laptop)}%</Badge>
      <div className="text-secondary text-decoration-line-through small">{formatPrice(laptop.price)}</div>
    </div>
  );
}
