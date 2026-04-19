export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));

export const formatDateTime = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));

export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x400?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${process.env.REACT_APP_API_URL?.replace('/api', '') || ''}/uploads/${path.replace('/uploads/', '')}`;
};

export const ORDER_STATUS_COLORS = {
  Placed: 'badge-placed',
  Confirmed: 'badge-confirmed',
  Processing: 'badge-processing',
  Shipped: 'badge-shipped',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
  Returned: 'badge-returned',
};

export const truncate = (str, n = 80) => (str?.length > n ? str.slice(0, n) + '…' : str);
