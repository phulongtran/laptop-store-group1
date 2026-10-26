import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

/** F7. Trang 404 */
export default function NotFoundPage() {
  usePageTitle('Không tìm thấy trang');
  return (
    <div className="text-center py-5">
      <div className="display-1 fw-bold text-primary">404</div>
      <h3 className="mb-3">Không tìm thấy trang</h3>
      <p className="text-secondary">Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa.</p>
      <Button as={Link} to="/" size="lg">
        Về trang chủ
      </Button>
    </div>
  );
}
