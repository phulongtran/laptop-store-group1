import { useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Form, Table } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import { getErrorMessage } from '../../api/axiosClient';
import { useToast } from '../../contexts/ToastContext';
import useAxios from '../../hooks/useAxios';
import usePageTitle from '../../hooks/usePageTitle';
import { formatDateTime, formatPrice } from '../../utils/format';
import { getStatus, NEXT_STATUS, ORDER_STATUS } from '../../utils/orderStatus';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';

/** G4. Quản lý đơn hàng (admin) */
export default function AdminOrderPage() {
  usePageTitle('Quản lý đơn hàng');
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? ''; // lọc đồng bộ trên URL ?status=
  const [updatingId, setUpdatingId] = useState(null);

  const { data: orders, loading, error, refetch, setData } = useAxios(
    (signal) => orderApi.getAll(status ? { status } : {}, signal),
    [status]
  );

  const changeStatus = async (order, newStatus) => {
    setUpdatingId(order.id);
    try {
      const updated = await orderApi.updateStatus(order.id, newStatus); // PATCH { status }
      setData((list) =>
        list
          .map((o) => (o.id === order.id ? updated : o))
          // đang lọc theo trạng thái cũ → đơn không còn thuộc nhóm này
          .filter((o) => !status || o.status === status)
      );
      showToast(`Đơn #${order.id}: ${ORDER_STATUS[newStatus].label}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'danger');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <h3 className="fw-bold mb-3">Quản lý đơn hàng</h3>

      <ButtonGroup className="mb-3 flex-wrap">
        <Button variant={status === '' ? 'dark' : 'outline-dark'} onClick={() => setSearchParams({})}>
          Tất cả
        </Button>
        {Object.entries(ORDER_STATUS).map(([key, s]) => (
          <Button
            key={key}
            variant={status === key ? 'dark' : 'outline-dark'}
            onClick={() => setSearchParams({ status: key })}
          >
            {s.label}
          </Button>
        ))}
      </ButtonGroup>

      {loading && <Loading />}
      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {!loading && !error && (
        <Card className="shadow-sm">
          {orders.length === 0 ? (
            <EmptyState icon="📦" message="Không có đơn hàng nào" />
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mã</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Sản phẩm</th>
                  <th className="text-end">Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 180 }}>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const current = getStatus(order.status);
                  const next = NEXT_STATUS[order.status]; // BR-06
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <div>{order.customer.fullName}</div>
                        <small className="text-secondary">{order.customer.phone}</small>
                      </td>
                      <td className="text-nowrap">{formatDateTime(order.createdAt)}</td>
                      <td style={{ minWidth: 200 }}>
                        {order.items.map((it) => (
                          <div key={it.laptopId} className="small">
                            {it.name} × {it.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="text-end text-nowrap fw-semibold">{formatPrice(order.total)}</td>
                      <td>
                        <Badge bg={current.variant}>{current.label}</Badge>
                      </td>
                      <td>
                        {/* Chỉ hiện trạng thái kế tiếp hợp lệ; done / cancelled bị khoá */}
                        <Form.Select
                          size="sm"
                          aria-label={`Trạng thái đơn ${order.id}`}
                          value={order.status}
                          disabled={!next || updatingId === order.id}
                          onChange={(e) => changeStatus(order, e.target.value)}
                        >
                          <option value={order.status}>{current.label}</option>
                          {next && <option value={next}>→ {ORDER_STATUS[next].label}</option>}
                        </Form.Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </>
  );
}
