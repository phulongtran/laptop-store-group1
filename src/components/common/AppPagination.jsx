import { Pagination } from 'react-bootstrap';

/** E6. Phân trang: First / Prev / các số trang / Next / Last */
export default function AppPagination({ page, totalPages, onChange, maxButtons = 5 }) {
  if (totalPages <= 1) return null;

  // Cửa sổ các số trang quanh trang hiện tại
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  const end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  const pages = [];
  for (let p = start; p <= end; p += 1) pages.push(p);

  const go = (p) => {
    if (p >= 1 && p <= totalPages && p !== page) onChange(p);
  };

  return (
    <Pagination className="justify-content-center mt-4 flex-wrap">
      <Pagination.First disabled={page === 1} onClick={() => go(1)} />
      <Pagination.Prev disabled={page === 1} onClick={() => go(page - 1)} />
      {start > 1 && <Pagination.Ellipsis disabled />}
      {pages.map((p) => (
        <Pagination.Item key={p} active={p === page} onClick={() => go(p)}>
          {p}
        </Pagination.Item>
      ))}
      {end < totalPages && <Pagination.Ellipsis disabled />}
      <Pagination.Next disabled={page === totalPages} onClick={() => go(page + 1)} />
      <Pagination.Last disabled={page === totalPages} onClick={() => go(totalPages)} />
    </Pagination>
  );
}
