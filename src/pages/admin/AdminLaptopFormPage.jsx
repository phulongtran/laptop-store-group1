import { useState } from 'react';
import { Alert, Breadcrumb, Card } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import laptopApi from '../../api/laptopApi';
import catalogApi from '../../api/catalogApi';
import { getErrorMessage } from '../../api/axiosClient';
import useAxios from '../../hooks/useAxios';
import usePageTitle from '../../hooks/usePageTitle';
import LaptopForm, { EMPTY_LAPTOP, toFormValues } from '../../components/laptop/LaptopForm';
import Loading from '../../components/common/Loading';
import ErrorAlert from '../../components/common/ErrorAlert';
import NotFoundPage from '../NotFoundPage';

/**
 * F4. Trang dùng chung cho thêm và sửa:
 *   /admin/laptops/new      → không có id → POST
 *   /admin/laptops/:id/edit → có id       → GET rồi PUT
 */
export default function AdminLaptopFormPage() {
  const { id } = useParams();
  if (id !== undefined && !/^\d+$/.test(id)) return <NotFoundPage />;
  // key: chuyển từ "sửa" sang "thêm mới" → form được tạo lại với giá trị trống
  return <LaptopFormScreen key={id ?? 'new'} id={id} />;
}

function LaptopFormScreen({ id }) {
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Tải song song: hãng, loại và (nếu sửa) laptop hiện tại
  const { data, loading, error, refetch } = useAxios(
    async (signal) => {
      const [brands, categories, laptop] = await Promise.all([
        catalogApi.getBrands(signal),
        catalogApi.getCategories(signal),
        isEdit ? laptopApi.getById(id, signal) : Promise.resolve(null),
      ]);
      return { brands, categories, laptop };
    },
    [id]
  );

  usePageTitle(isEdit ? `Sửa ${data?.laptop?.name ?? 'laptop'}` : 'Thêm laptop');

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      let saved;
      if (isEdit) {
        // PUT gửi ĐẦY ĐỦ object: giữ nguyên sold, rating, createdAt cũ.
        // Bỏ brand, category (do _expand thêm vào) – không phải dữ liệu của laptop.
        // eslint-disable-next-line no-unused-vars
        const { brand, category, ...original } = data.laptop;
        saved = await laptopApi.update(id, { ...original, ...payload, id: original.id });
      } else {
        saved = await laptopApi.create({
          ...payload,
          sold: 0,
          rating: 0,
          createdAt: new Date().toISOString(),
        });
      }
      // F5. Trang đích (AdminLayout → useFlashMessage) hiện Toast
      navigate('/admin/laptops', { state: { message: `Đã lưu "${saved.name}"` } });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} onRetry={refetch} />;

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin/laptops' }}>
          Quản lý laptop
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{isEdit ? `Sửa #${id}` : 'Thêm mới'}</Breadcrumb.Item>
      </Breadcrumb>

      <h3 className="fw-bold mb-3">{isEdit ? `Sửa: ${data.laptop.name}` : 'Thêm laptop mới'}</h3>
      {submitError && <Alert variant="danger">{submitError}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <LaptopForm
            initialValues={isEdit ? toFormValues(data.laptop) : EMPTY_LAPTOP}
            brands={data.brands}
            categories={data.categories}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitText={isEdit ? 'Cập nhật (PUT)' : 'Thêm laptop (POST)'}
          />
        </Card.Body>
      </Card>
    </>
  );
}
