export default function EmptyState({ icon = '🔍', message = 'Không tìm thấy laptop phù hợp', children }) {
  return (
    <div className="text-center py-5 text-secondary">
      <div style={{ fontSize: '3rem' }} aria-hidden="true">
        {icon}
      </div>
      <p className="fs-5 mt-2">{message}</p>
      {children}
    </div>
  );
}
