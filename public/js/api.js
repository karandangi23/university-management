// ─────────────────────────────────────────────────────────────
//  api.js — All fetch calls to the Express/Oracle backend
// ─────────────────────────────────────────────────────────────

const BASE = '';  // same origin; change if backend runs on different port

const Api = {
  async get(path) {
    const res = await fetch(BASE + path);
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },
  async post(path, data) {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },
  async put(path, data) {
    const res = await fetch(BASE + path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },
  async del(path) {
    const res = await fetch(BASE + path, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },

  // ── Departments ──
  getDepartments:   () => Api.get('/api/departments'),
  addDepartment:    (d) => Api.post('/api/departments', d),
  updateDepartment: (id, d) => Api.put(`/api/departments/${id}`, d),
  deleteDepartment: (id) => Api.del(`/api/departments/${id}`),

  // ── Students ──
  getStudents:   () => Api.get('/api/students'),
  addStudent:    (d) => Api.post('/api/students', d),
  updateStudent: (id, d) => Api.put(`/api/students/${id}`, d),
  deleteStudent: (id) => Api.del(`/api/students/${id}`),

  // ── Faculty ──
  getFaculty:    () => Api.get('/api/faculty'),
  addFaculty:    (d) => Api.post('/api/faculty', d),
  updateFaculty: (id, d) => Api.put(`/api/faculty/${id}`, d),
  deleteFaculty: (id) => Api.del(`/api/faculty/${id}`),

  // ── Courses ──
  getCourses:    () => Api.get('/api/courses'),
  addCourse:     (d) => Api.post('/api/courses', d),
  updateCourse:  (id, d) => Api.put(`/api/courses/${id}`, d),
  deleteCourse:  (id) => Api.del(`/api/courses/${id}`),

  // ── Semesters ──
  getSemesters:    () => Api.get('/api/semesters'),
  addSemester:     (d) => Api.post('/api/semesters', d),
  updateSemester:  (id, d) => Api.put(`/api/semesters/${id}`, d),
  deleteSemester:  (id) => Api.del(`/api/semesters/${id}`),

  // ── Course Offerings ──
  getOfferings:    () => Api.get('/api/offerings'),
  addOffering:     (d) => Api.post('/api/offerings', d),
  updateOffering:  (id, d) => Api.put(`/api/offerings/${id}`, d),
  deleteOffering:  (id) => Api.del(`/api/offerings/${id}`),

  // ── Enrollments ──
  getEnrollments:   () => Api.get('/api/enrollments'),
  addEnrollment:    (d) => Api.post('/api/enrollments', d),
  updateEnrollment: (id, d) => Api.put(`/api/enrollments/${id}`, d),
  deleteEnrollment: (id) => Api.del(`/api/enrollments/${id}`),

  // ── Payments ──
  getPayments:    () => Api.get('/api/payments'),
  addPayment:     (d) => Api.post('/api/payments', d),
  updatePayment:  (id, d) => Api.put(`/api/payments/${id}`, d),
  deletePayment:  (id) => Api.del(`/api/payments/${id}`),

  // ── Stats ──
  getStats: () => Api.get('/api/stats'),
};
