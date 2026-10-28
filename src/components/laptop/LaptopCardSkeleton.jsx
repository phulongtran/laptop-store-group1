import { Card, Placeholder } from 'react-bootstrap';

/** E. Skeleton khi đang tải danh sách (không chỉ 1 Spinner giữa trang) */
export default function LaptopCardSkeleton() {
  return (
    <Card className="h-100 shadow-sm" aria-hidden="true">
      <div className="laptop-card-img bg-body-secondary placeholder-wave" />
      <Card.Body>
        <Placeholder as={Card.Title} animation="wave">
          <Placeholder xs={10} />
          <Placeholder xs={6} />
        </Placeholder>
        <Placeholder as="div" animation="wave" className="mb-2">
          <Placeholder xs={4} size="sm" />
          <Placeholder xs={3} size="sm" />
          <Placeholder xs={3} size="sm" />
        </Placeholder>
        <Placeholder as="div" animation="wave">
          <Placeholder xs={7} size="lg" />
        </Placeholder>
        <Placeholder.Button variant="primary" xs={12} className="mt-2" />
      </Card.Body>
    </Card>
  );
}
