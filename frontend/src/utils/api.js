import axios from 'axios'

// Use relative paths - Vite proxy will handle forwarding to backend
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
}

// Students API endpoints
export const studentsAPI = {
  getAll: () => api.get('/students'),
  create: (student) => api.post('/students', student),
  update: (id, student) => api.patch(`/students/${id}`, student),
  delete: (id) => api.delete(`/students/${id}`),
}

// Teachers API endpoints
export const teachersAPI = {
  getAll: () => api.get('/teachers'),
  create: (teacher) => api.post('/teachers', teacher),
  update: (id, teacher) => api.patch(`/teachers/${id}`, teacher),
  delete: (id) => api.delete(`/teachers/${id}`),
}

// Admin API endpoints
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  getDepartments: () => api.get('/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  createTeacher: (data) => api.post('/teachers', data),
  createStudent: (data) => api.post('/students', data),
  getClassrooms: () => api.get('/classrooms/'),
  getFeeOverview: () => api.get('/admin/fees/overview'),
  getAnalytics: () => api.get('/admin/analytics/performance'),
  exportData: (modelName) => api.get(`/admin/export/${modelName}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  createBackup: () => api.post('/admin/settings/backup'),
  getSystemInfo: () => api.get('/admin/settings/system-info'),
  getDorms: () => api.get('/dorms'),
  createDorm: (data) => api.post('/dorms', data),
  getDormAssignments: () => api.get('/dorm-assignments'),
  assignStudentToDorm: (data) => api.post('/dorm-assignments', data),
  getAllResults: () => api.get('/admin/results'),
  getStudents: () => api.get('/students'),
  getSubjects: () => api.get('/subjects'),
  createSubject: (data) => api.post('/subjects', data),
}

// Teacher API endpoints
export const teacherAPI = {
  getDashboard: () => api.get('/teacher/dashboard'),
  getMySubjects: () => api.get('/teacher/my-subjects'),
  getSubjects: () => api.get('/teacher/subjects'),
  getSubjectOverview: (subjectId) => api.get(`/teacher/subject/${subjectId}`),
  getSubjectStudents: (subjectId) => api.get(`/teacher/subjects/${subjectId}/students`),
  enrollStudent: (data) => api.post('/enrollments', data),
  getEnrollments: () => api.get('/teacher/enrollments'),
  markAttendance: (data) => api.post('/attendance', data),
  markBulkAttendance: (data) => api.post('/attendance/bulk', data),
  getAttendance: (subjectId, date) => api.get(`/attendance?subject_id=${subjectId}&date=${date}`),
  getResults: () => api.get('/teacher/results'),
  getSubjectResults: (subjectId) => api.get(`/teacher/subjects/${subjectId}/results`),
  addResult: (data) => api.post('/results', data),
  updateResult: (id, data) => api.put(`/results/${id}`, data),
  deleteResult: (id) => api.delete(`/results/${id}`),
  removeEnrollment: (id) => api.delete(`/enrollments/${id}`),
}

// Student API endpoints
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getMyReports: () => api.get('/student/reports'),
  getFees: () => api.get('/student/fees'),
  makePayment: (data) => api.post('/student/fees/pay', data),
  getMyResults: () => api.get('/student/results'),
  getMyAttendance: () => api.get('/student/attendance'),
}

export default api