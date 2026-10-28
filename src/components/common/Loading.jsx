import { Spinner } from 'react-bootstrap';

export default function Loading({ text = 'Đang tải...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
      <Spinner animation="border" variant="primary" role="status" />
      <span className="mt-2">{text}</span>
    </div>
  );
}
