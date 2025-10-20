export function normalizeApiResponse(response) {
  const isSuccess =
    response?.data?.isSuccess ??
    response?.data?.IsSuccess ??
    response?.data?.success ??
    false;

  const data =
    response?.data?.result ??
    response?.data?.Result ??
    response?.data?.data ??
    response?.data?.Data ??
    null;

  const message =
    response?.data?.message ??
    response?.data?.Message ??
    'Không có thông báo từ API.';

  return { isSuccess, data, message };
}
