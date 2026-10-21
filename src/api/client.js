/**
 * EcoConnect Unified API Client
 * Connects frontend portals directly to Express/MongoDB backend
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const defaultHeaders = {
    Accept: 'application/json',
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('ecoconnect_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // ── Authentication
  auth: {
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }).then((res) => {
        if (res.token) localStorage.setItem('ecoconnect_token', res.token);
        return res;
      }),
    logout: () =>
      request('/auth/logout', { method: 'POST' }).finally(() => {
        localStorage.removeItem('ecoconnect_token');
      }),
    me: () => request('/auth/me'),
    updateProfile: (profileData) =>
      request('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      }),
    demoLogin: (role) =>
      request('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }).then((res) => {
        if (res.token) localStorage.setItem('ecoconnect_token', res.token);
        return res;
      }),
  },

  // ── Citizen Endpoints
  citizen: {
    getDashboard: () => request('/citizen/dashboard'),
    getCredits: () => request('/citizen/credits'),
    getTransactions: () => request('/citizen/credits/transactions'),
    redeemPerk: (perkTitle, cost) =>
      request('/citizen/credits/redeem', {
        method: 'POST',
        body: JSON.stringify({ perkTitle, cost }),
      }),
  },

  // ── Pickups
  pickups: {
    create: (pickupData) =>
      request('/pickups', {
        method: 'POST',
        body: JSON.stringify(pickupData),
      }),
    getMine: () => request('/pickups/mine'),
    getAll: (params = '') => request(`/pickups${params ? `?${params}` : ''}`),
    schedule: (id, pickupDate) =>
      request(`/pickups/${id}/schedule`, {
        method: 'PATCH',
        body: JSON.stringify({ pickupDate }),
      }),
    verify: (id, verificationData) =>
      request(`/pickups/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify(verificationData),
      }),
  },

  // ── Complaints
  complaints: {
    create: (complaintData) =>
      request('/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData),
      }),
    getMine: () => request('/complaints/mine'),
    getAll: (params = '') => request(`/complaints${params ? `?${params}` : ''}`),
    assign: (id, teamName, priority) =>
      request(`/complaints/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ teamName, priority }),
      }),
    updateStatus: (id, status, resolutionNotes) =>
      request(`/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, resolutionNotes }),
      }),
    completeWork: (id, completionData) =>
      request(`/complaints/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify(completionData),
      }),
  },

  // ── Municipality
  municipality: {
    getDashboard: () => request('/municipality/dashboard'),
    getNotifications: () => request('/municipality/notifications'),
    getActivityLogs: () => request('/municipality/activity-logs'),
    getInventory: () => request('/municipality/inventory'),
    getInventoryTransactions: () => request('/municipality/inventory/transactions'),
    getPurchaseRequests: () => request('/industry/purchase-requests'),
    approveOrder: (id) => request(`/industry/purchase-requests/${id}/approve`, { method: 'PATCH' }),
    rejectOrder: (id, reason) =>
      request(`/industry/purchase-requests/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),
    getOrders: () => request('/municipality/orders'),
    verifyLoadingOtp: (id, data) =>
      request(`/municipality/orders/${id}/verify-loading`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getPickupScheduleTargets: () => request('/municipality/pickup-schedule/targets'),
    getPickupSchedule: (params = '') =>
      request(`/municipality/pickup-schedule${params ? `?${params}` : ''}`),
    savePickupSchedule: (data) =>
      request('/municipality/pickup-schedule', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ── Industry
  industry: {
    getDashboard: () => request('/industry/dashboard'),
    getNotifications: () => request('/industry/notifications'),
    getMarketplace: () => request('/industry/marketplace'),
    createPurchaseRequest: (data) =>
      request('/industry/purchase-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyPurchaseRequests: () => request('/industry/purchase-requests/mine'),
    getOrders: () => request('/industry/orders'),
    updateDriver: (id, data) =>
      request(`/industry/orders/${id}/driver`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    dispatchTruck: (id) =>
      request(`/industry/orders/${id}/dispatch`, {
        method: 'PATCH',
      }),
    generateLoadingOtp: (id) =>
      request(`/industry/orders/${id}/loading-otp`, {
        method: 'POST',
      }),
    generateDeliveryOtp: (id) =>
      request(`/industry/orders/${id}/delivery-otp`, {
        method: 'POST',
      }),
    verifyDelivery: (id, data) =>
      request(`/industry/orders/${id}/verify-delivery`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ── Upload
  upload: {
    uploadImage: async (file, folder = 'ecoconnect') => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      return request('/upload', {
        method: 'POST',
        body: formData,
      });
    },
  },
};
