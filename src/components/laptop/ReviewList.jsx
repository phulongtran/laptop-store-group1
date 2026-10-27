import { ListGroup } from 'react-bootstrap';
import StarRating from '../common/StarRating';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/format';

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <EmptyState icon="💬" message="Chưa có đánh giá nào. Hãy là người đầu tiên!" />;
  }

  return (
    <ListGroup variant="flush">
      {reviews.map((review) => (
        <ListGroup.Item key={review.id} className="px-0">
          <div className="d-flex justify-content-between flex-wrap">
            <strong>{review.userName ?? 'Khách hàng'}</strong>
            <small className="text-secondary">{formatDate(review.createdAt)}</small>
          </div>
          <StarRating value={review.rating} showValue={false} />
          <p className="mb-0 mt-1">{review.comment}</p>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
