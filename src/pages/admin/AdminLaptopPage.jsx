import { useEffect, useState } from 'react';
import { Button, Card, Form, Image, InputGroup, Spinner, Table } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import laptopApi from '../../api/laptopApi';
import { getErrorMessage } from '../../api/axiosClient';
import { useToast } from '../../contexts/ToastContext';
import useAxios from '../../hooks/useAxios';
import useDebounce from '../../hooks/useDebounce';
import usePageTitle from '../../hooks/usePageTitle';
import { formatPrice, getSellingPrice } from '../../utils/format';
import { handleImageError } from '../../utils/image';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import AppPagination from '../../components/common/AppPagination';

const ADMIN_PAGE_SIZE = 10;

/** G3 + H3 + H4. Quản trị laptop */
export default function AdminLaptopPage() {
  usePageTitle('Quản trị laptop');
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const page = Number(searchParams.get('page')) || 1;

  const { data, loading, error, refetch, setData } = useAxios(
    (signal) =>
      laptopApi.getAll(
        { q: q || undefined, _page: page, _limit: ADMIN_PAGE_SIZE, _sort: 'id', _order: 'desc', _expand: 'brand' },
        signal
      ),
    [q, page]
  );
  const items = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.total / ADMIN_PAGE_SIZE) : 0;

  const [selected, setSelected] = useState(() => new Set());
  const [toDelete, setToDelete] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editingStock, setEditingStock] = useState(null); // { id, value }
  const [savingStock, setSavingStock] = useState(false);

  // H2. Tìm kiếm có debounce, lưu q lên URL
  const [keyword, setKeyword] = useState(q);
  const debouncedKeyword = useDebounce(keyword.trim(), 500);
  useEffect(() => {
    if (debouncedKeyword === q) return;
    const next = new URLSearchParams();
    if (debouncedKeyword) next.set('q', debouncedKeyword);
    setSearchParams(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  // Đổi trang / từ khoá → bỏ chọn
  useEffect(() => {
    setSelected(new Set());
  }, [q, page]);

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    if (p <= 1) next.delete('page');
    else next.set('page', p);
    setSearchParams(next);
  };

  /** Xoá xong: trang hiện tại rỗng → lùi về trang trước, ngược lại tải lại để lấp chỗ trống */
  const afterDelete = (remainingOnPage) => {
    if (remainingOnPage === 0 && page > 1) goToPage(page - 1);
    else refetch();
  };

  /* ---------------- Chọn nhiều ---------------- */
  const allChecked = items.length > 0 && items.every((i) => selected.has(i.id));
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(items.map((i) => i.id)));
  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* ---------------- H4. Xoá 1 laptop – optimistic ---------------- */
  const deleteOne = async () => {
    const laptop = toDelete;
    setToDelete(null);

    const snapshot = data; // 1. lưu bản sao
    setData((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== laptop.id), total: prev.total - 1 })); // 2. xoá ngay
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(laptop.id);
      return next;
    });

    try {
      await laptopApi.remove(laptop.id); // 3. gọi API
      showToast(`Đã xóa "${laptop.name}"`);
      afterDelete(snapshot.items.length - 1);
    } catch {
      setData(snapshot); // 4. lỗi → khôi phục
      showToast('Xóa thất bại, đã khôi phục', 'danger');
    }
  };

  /* ---------------- H3. Xoá hàng loạt – Promise.allSettled ---------------- */
  const deleteSelected = async () => {
    const ids = [...selected];
    setBulkDeleting(true);

    // Song song; 1 request lỗi không làm hỏng các request khác
    const results = await Promise.allSettled(ids.map((id) => laptopApi.remove(id)));
    const failedIds = ids.filter((_, i) => results[i].status === 'rejected');
    const okCount = ids.length - failedIds.length;

    let message = `Đã xóa ${okCount}/${ids.length} laptop.`;
    if (failedIds.length > 0) message += ` ${failedIds.length} laptop xóa thất bại.`;
    showToast(message, failedIds.length === 0 ? 'success' : okCount === 0 ? 'danger' : 'warning');

    setBulkDeleting(false);
    setShowBulkConfirm(false);
    setSelected(new Set(failedIds)); // bỏ chọn dòng thành công, giữ chọn dòng thất bại

    const remaining = items.filter((i) => !ids.includes(i.id) || failedIds.includes(i.id)).length;
    afterDelete(remaining);
  };

  /* ---------------- G3. Sửa nhanh tồn kho – PATCH { stock } ---------------- */
  const saveStock = async () => {
    const { id, value } = editingStock;
    const stock = Number(value);
    if (value === '' || !Number.isInteger(stock) || stock < 0) {
      showToast('Tồn kho phải là số nguyên ≥ 0', 'warning');
      return;
    }
    setSavingStock(true);
    try {
      const updated = await laptopApi.patch(id, { stock });
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === id ? { ...i, stock: updated.stock } : i)),
      }));
      showToast(`Đã cập nhật tồn kho "${updated.name}": ${updated.stock}`);
      setEditingStock(null);
    } catch (err) {
      showToast(getErrorMessage(err), 'danger');
    } finally {
      setSavingStock(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h3 className="fw-bold mb-0">Quản lý laptop</h3>
        <Button as={Link} to="/admin/laptops/new">
          + Thêm laptop
        </Button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <InputGroup style={{ maxWidth: 400 }}>
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Tìm laptop..."
            aria-label="Tìm laptop"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </InputGroup>
        <Button variant="danger" disabled={selected.size === 0} onClick={() => setShowBulkConfirm(true)}>
          Xóa đã chọn ({selected.size})
        </Button>
        {loading && data && <Spinner size="sm" className="align-self-center" />}
      </div>

      {error && <ErrorAlert message={error} onRetry={refetch} />}
      {loading && !data && <Loading />}

      {data && !error && (
        <Card className="shadow-sm">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}>
                    <Form.Check aria-label="Chọn tất cả" checked={allChecked} onChange={toggleAll} />
                  </th>
                  <th>ID</th>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Hãng</th>
                  <th className="text-end">Giá bán</th>
                  <th className="text-center">Tồn kho</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((laptop) => (
                  <tr key={laptop.id} className={selected.has(laptop.id) ? 'table-active' : undefined}>
                    <td>
                      <Form.Check
                        aria-label={`Chọn ${laptop.name}`}
                        checked={selected.has(laptop.id)}
                        onChange={() => toggleOne(laptop.id)}
                      />
                    </td>
                    <td>{laptop.id}</td>
                    <td>
                      <Image src={laptop.image} alt="" width={64} rounded className="border" onError={handleImageError} />
                    </td>
                    <td style={{ minWidth: 200 }}>
                      <Link to={`/laptops/${laptop.id}`} className="text-decoration-none">
                        {laptop.name}
                      </Link>
                    </td>
                    <td>{laptop.brand?.name}</td>
                    <td className="text-end text-nowrap">{formatPrice(getSellingPrice(laptop))}</td>
                    <td className="text-center" style={{ width: 130 }}>
                      {editingStock?.id === laptop.id ? (
                        <Form.Control
                          size="sm"
                          type="number"
                          min={0}
                          autoFocus
                          aria-label="Tồn kho mới"
                          value={editingStock.value}
                          disabled={savingStock}
                          onChange={(e) => setEditingStock({ id: laptop.id, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveStock();
                            if (e.key === 'Escape') setEditingStock(null);
                          }}
                          onBlur={() => !savingStock && setEditingStock(null)}
                        />
                      ) : (
                        <Button
                          variant="link"
                          size="sm"
                          title="Bấm để sửa nhanh, Enter để lưu"
                          className={`fw-semibold text-decoration-none ${laptop.stock < 5 ? 'text-danger' : 'text-body'}`}
                          onClick={() => setEditingStock({ id: laptop.id, value: String(laptop.stock) })}
                        >
                          {laptop.stock} ✎
                        </Button>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      <Button as={Link} to={`/admin/laptops/${laptop.id}/edit`} size="sm" variant="outline-primary" className="me-2">
                        Sửa
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setToDelete(laptop)}>
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      <AppPagination page={page} totalPages={totalPages} onChange={goToPage} />

      <ConfirmModal
        show={Boolean(toDelete)}
        title="Xóa laptop"
        message={toDelete && `Bạn có chắc muốn xóa "${toDelete.name}"?`}
        confirmText="Xóa"
        onConfirm={deleteOne}
        onCancel={() => setToDelete(null)}
      />
      <ConfirmModal
        show={showBulkConfirm}
        title="Xóa nhiều laptop"
        message={`Bạn có chắc muốn xóa ${selected.size} laptop đã chọn?`}
        confirmText="Xóa tất cả"
        loading={bulkDeleting}
        onConfirm={deleteSelected}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </>
  );
}
