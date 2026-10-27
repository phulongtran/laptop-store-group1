/** Hiển thị số sao, ví dụ 4.6 → ★★★★★ (làm tròn) */
export default function StarRating({ value = 0, showValue = true }) {
  const rounded = Math.round(value);
  return (
    <span className="text-warning" title={`${value}/5`}>
      {'★'.repeat(rounded)}
      <span className="text-body-tertiary">{'★'.repeat(5 - rounded)}</span>
      {showValue && <span className="text-secondary small ms-1">{Number(value).toFixed(1)}</span>}
    </span>
  );
}
