import { Alert } from 'react-bootstrap';
import usePageTitle from '../../hooks/usePageTitle';

/** Trang tạm cho các route chưa làm */
export default function ComingSoon({ title, issue }) {
  usePageTitle(title);
  return (
    <Alert variant="info" className="my-4">
      <Alert.Heading as="h4">{title}</Alert.Heading>
      <p className="mb-0">Trang đang phát triển{issue ? ` – xem issue ${issue}` : ''}.</p>
    </Alert>
  );
}
