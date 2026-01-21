// API utility functions for data fetching

const API_BASE = '/api';

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Employee API
export const employeesAPI = {
  list: (params?: { department?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.department) searchParams.set('department', params.department);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return fetchAPI(`/employees${query ? `?${query}` : ''}`);
  },
  get: (id: string) => fetchAPI(`/employees/${id}`),
  create: (data: any) => fetchAPI('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/employees/${id}`, { method: 'DELETE' }),
};

// Leave API
export const leaveAPI = {
  getRequests: (params?: { employeeId?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return fetchAPI(`/leave${query ? `?${query}` : ''}`);
  },
  getBalances: (params?: { employeeId?: string; year?: number }) => {
    const searchParams = new URLSearchParams({ type: 'balances' });
    if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
    if (params?.year) searchParams.set('year', params.year.toString());
    return fetchAPI(`/leave?${searchParams.toString()}`);
  },
  createRequest: (data: any) => fetchAPI('/leave', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string, approvedBy?: string, rejectionReason?: string) =>
    fetchAPI('/leave', { method: 'PATCH', body: JSON.stringify({ id, status, approvedBy, rejectionReason }) }),
};

// Overtime API
export const overtimeAPI = {
  list: (params?: { employeeId?: string; status?: string; month?: number; year?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.month) searchParams.set('month', params.month.toString());
    if (params?.year) searchParams.set('year', params.year.toString());
    const query = searchParams.toString();
    return fetchAPI(`/overtime${query ? `?${query}` : ''}`);
  },
  create: (data: any) => fetchAPI('/overtime', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string, approvedBy?: string) =>
    fetchAPI('/overtime', { method: 'PATCH', body: JSON.stringify({ id, status, approvedBy }) }),
  delete: (id: string) => fetchAPI(`/overtime?id=${id}`, { method: 'DELETE' }),
};

// Documents API
export const documentsAPI = {
  list: (params?: { employeeId?: string; documentType?: string; expiryStatus?: string; daysAhead?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
    if (params?.documentType) searchParams.set('documentType', params.documentType);
    if (params?.expiryStatus) searchParams.set('expiryStatus', params.expiryStatus);
    if (params?.daysAhead) searchParams.set('daysAhead', params.daysAhead.toString());
    const query = searchParams.toString();
    return fetchAPI(`/documents${query ? `?${query}` : ''}`);
  },
  create: (data: any) => fetchAPI('/documents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI('/documents', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => fetchAPI(`/documents?id=${id}`, { method: 'DELETE' }),
};

// Payroll API
export const payrollAPI = {
  getRuns: (params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.month) searchParams.set('month', params.month.toString());
    if (params?.year) searchParams.set('year', params.year.toString());
    const query = searchParams.toString();
    return fetchAPI(`/payroll${query ? `?${query}` : ''}`);
  },
  getEntries: (runId: string) => fetchAPI(`/payroll?type=entries&runId=${runId}`),
  createRun: (month: number, year: number) => fetchAPI('/payroll', { method: 'POST', body: JSON.stringify({ month, year }) }),
  updateStatus: (id: string, status: string, processedBy?: string) =>
    fetchAPI('/payroll', { method: 'PATCH', body: JSON.stringify({ id, status, processedBy }) }),
};

// Settings API
export const settingsAPI = {
  getCompany: () => fetchAPI('/settings?type=company'),
  getUsers: () => fetchAPI('/settings?type=users'),
  getSubscription: () => fetchAPI('/settings?type=subscription'),
  getSystem: () => fetchAPI('/settings?type=system'),
  getNotifications: () => fetchAPI('/settings?type=notifications'),
  updateCompany: (data: any) => fetchAPI('/settings', { method: 'PUT', body: JSON.stringify({ type: 'company', ...data }) }),
  updateSystem: (data: any) => fetchAPI('/settings', { method: 'PUT', body: JSON.stringify({ type: 'system', ...data }) }),
  updateNotifications: (data: any) => fetchAPI('/settings', { method: 'PUT', body: JSON.stringify({ type: 'notifications', ...data }) }),
  createUser: (data: any) => fetchAPI('/settings', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (userId: string, data: any) => fetchAPI('/settings', { method: 'PATCH', body: JSON.stringify({ userId, ...data }) }),
  deleteUser: (userId: string) => fetchAPI(`/settings?userId=${userId}`, { method: 'DELETE' }),
};
