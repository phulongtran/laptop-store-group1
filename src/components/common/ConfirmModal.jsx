import { Button, Modal, Spinner } from 'react-bootstrap';

/** Modal xác nhận dùng chung (TECH-05) */
export default function ConfirmModal({
  show,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal show={show} onHide={loading ? undefined : onCancel} centered>
      <Modal.Header closeButton={!loading}>
        <Modal.Title as="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading && <Spinner size="sm" className="me-2" />}
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
