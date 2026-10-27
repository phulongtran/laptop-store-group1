import { Col, Row } from 'react-bootstrap';
import LaptopCard from './LaptopCard';
import LaptopCardSkeleton from './LaptopCardSkeleton';
import EmptyState from '../common/EmptyState';

/** Lưới sản phẩm responsive: 1 / 2 / 3 / 4 cột */
export default function LaptopGrid({
  laptops,
  loading,
  skeletonCount = 8,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
}) {
  if (loading) {
    return (
      <Row {...cols} className="g-3">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <Col key={i}>
            <LaptopCardSkeleton />
          </Col>
        ))}
      </Row>
    );
  }

  if (!laptops || laptops.length === 0) {
    return <EmptyState />;
  }

  return (
    <Row {...cols} className="g-3">
      {laptops.map((laptop) => (
        <Col key={laptop.id}>
          <LaptopCard laptop={laptop} />
        </Col>
      ))}
    </Row>
  );
}
