// ─────────────────────────────────────────────────────────────
//  app.js — SPA Router + All Page Renderers
// ─────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function toast(msg, type = 'success') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  setTimeout(() => el.classList.remove('show'), 3200);
}

function showLoading() {
  $('#pageContent').innerHTML = `<div class="loading"><div class="spinner"></div>Loading data…</div>`;
}

function escHtml(s) {
  if (s == null) return '—';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function filterTable(inputEl, tableId) {
  const q = inputEl.value.toLowerCase();
  const rows = $$(`#${tableId} tbody tr`);
  rows.forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none');
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(title, bodyHtml, onSave) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHtml;
  $('#modalOverlay').classList.add('open');
  const saveBtn = $('#modalSave');
  saveBtn.onclick = null;
  saveBtn.onclick = onSave;
}

function closeModal() { $('#modalOverlay').classList.remove('open'); }
$('#modalClose').onclick  = closeModal;
$('#modalCancel').onclick = closeModal;
$('#modalOverlay').onclick = (e) => { if (e.target === $('#modalOverlay')) closeModal(); };

// ── Sidebar ───────────────────────────────────────────────────
$('#sidebarToggle').onclick = () => {
  $('#sidebar').classList.toggle('open');
};

// ── DB Status ─────────────────────────────────────────────────
async function checkDbStatus() {
  try {
    await Api.getStats();
    $('#dbStatus .status-dot').className = 'status-dot connected';
    $('#dbStatusText').textContent = 'Oracle Connected';
  } catch {
    $('#dbStatus .status-dot').className = 'status-dot error';
    $('#dbStatusText').textContent = 'DB Offline';
  }
}

// ─────────────────────────────────────────────────────────────
//  ROUTER
// ─────────────────────────────────────────────────────────────
const pages = {
  dashboard, departments, students, faculty,
  courses, semesters, offerings, enrollments, payments
};

const pageTitles = {
  dashboard: 'Dashboard', departments: 'Departments',
  students: 'Students', faculty: 'Faculty',
  courses: 'Courses', semesters: 'Semesters',
  offerings: 'Course Offerings', enrollments: 'Enrollments',
  payments: 'Fee Payments',
};

$$('.nav-item').forEach(el => {
  el.onclick = (e) => {
    e.preventDefault();
    const page = el.dataset.page;
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    navigate(page);
  };
});

function navigate(page) {
  $('#pageTitle').textContent = pageTitles[page] || page;
  document.title = `Univera — ${pageTitles[page] || page}`;
  showLoading();
  const addBtn = $('#addBtn');
  addBtn.style.display = page === 'dashboard' ? 'none' : '';
  addBtn.onclick = null;
  pages[page]();
}

// ─────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────
async function dashboard() {
  try {
    const s = await Api.getStats();
    $('#pageContent').innerHTML = `
      <div class="dashboard-greeting">
        <h1>Welcome back 👋</h1>
        <p>Here's what's happening at your university today.</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Students</div>
          <div class="stat-value">${s.students}</div>
          <div class="stat-icon">🎓</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Faculty Members</div>
          <div class="stat-value">${s.faculty}</div>
          <div class="stat-icon">👨‍🏫</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Courses Offered</div>
          <div class="stat-value">${s.courses}</div>
          <div class="stat-icon">📚</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Enrollments</div>
          <div class="stat-value">${s.activeEnrollments}</div>
          <div class="stat-icon">📋</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Revenue Collected</div>
          <div class="stat-value">₹${Number(s.revenue).toLocaleString('en-IN')}</div>
          <div class="stat-icon">💰</div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-header"><div class="table-title">Quick Navigation</div></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;padding:20px;">
          ${[
            ['departments','🏛️','Departments'],
            ['students','🎓','Students'],
            ['faculty','👨‍🏫','Faculty'],
            ['courses','📚','Courses'],
            ['semesters','📅','Semesters'],
            ['offerings','⏰','Offerings'],
            ['enrollments','📋','Enrollments'],
            ['payments','💳','Payments'],
          ].map(([p,i,l]) => `
            <button onclick="navigateTo('${p}')" style="
              background:var(--ivory);border:1px solid var(--ivory-border);
              border-radius:10px;padding:18px 12px;cursor:pointer;
              text-align:center;transition:all .2s;font-family:'DM Sans',sans-serif;
              color:var(--text-main);"
              onmouseover="this.style.borderColor='var(--olive-mid)';this.style.background='var(--olive-wash)'"
              onmouseout="this.style.borderColor='var(--ivory-border)';this.style.background='var(--ivory)'">
              <div style="font-size:1.8rem;margin-bottom:6px">${i}</div>
              <div style="font-size:.8rem;font-weight:500">${l}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    $('#pageContent').innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Could not load stats: ${escHtml(e.message)}</p></div>`;
  }
}

function navigateTo(page) {
  $$('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  navigate(page);
}

// ─────────────────────────────────────────────────────────────
//  DEPARTMENTS
// ─────────────────────────────────────────────────────────────
async function departments() {
  try {
    const data = await Api.getDepartments();
    $('#pageContent').innerHTML = `
      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-title">All Departments (${data.length})</div>
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search…" oninput="filterTable(this,'deptTable')">
          </div>
        </div>
        <div class="table-scroll">
        <table id="deptTable">
          <thead><tr>
            <th>ID</th><th>Department Name</th><th>Code</th>
            <th>HOD</th><th>Phone</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${data.length ? data.map(d => `
            <tr>
              <td><span class="mono">${d.DEPARTMENT_ID}</span></td>
              <td>${escHtml(d.DEPARTMENT_NAME)}</td>
              <td><span class="badge badge-olive">${escHtml(d.DEPARTMENT_CODE)}</span></td>
              <td>${escHtml(d.HOD_NAME)}</td>
              <td><span class="mono">${escHtml(d.PHONE_NUMBER)}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon" onclick='editDept(${JSON.stringify(d)})'>✏️ Edit</button>
                  <button class="btn-icon danger" onclick="delDept(${d.DEPARTMENT_ID})">🗑️ Del</button>
                </div>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🏛️</div><p>No departments found</p></div></td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;

    $('#addBtn').onclick = () => openDeptModal();
  } catch (e) { toast(e.message, 'error'); }
}

function deptForm(d = {}) {
  return `<div class="form-grid">
    <div class="form-group"><label>Dept ID</label><input id="f_did" type="number" value="${d.DEPARTMENT_ID||''}" ${d.DEPARTMENT_ID?'disabled':''}></div>
    <div class="form-group"><label>Code</label><input id="f_dcode" value="${escHtml(d.DEPARTMENT_CODE||'')}"></div>
    <div class="form-group full"><label>Department Name</label><input id="f_dname" value="${escHtml(d.DEPARTMENT_NAME||'')}"></div>
    <div class="form-group"><label>HOD Name</label><input id="f_hod" value="${escHtml(d.HOD_NAME||'')}"></div>
    <div class="form-group"><label>Phone Number</label><input id="f_phone" value="${escHtml(d.PHONE_NUMBER||'')}"></div>
  </div>`;
}

function openDeptModal(d) {
  openModal(d ? 'Edit Department' : 'Add Department', deptForm(d), async () => {
    const body = {
      department_id: +$('#f_did').value,
      department_name: $('#f_dname').value,
      department_code: $('#f_dcode').value,
      hod_name: $('#f_hod').value,
      phone_number: $('#f_phone').value,
    };
    try {
      if (d) await Api.updateDepartment(d.DEPARTMENT_ID, body);
      else await Api.addDepartment(body);
      closeModal(); toast(d ? 'Department updated!' : 'Department added!');
      departments();
    } catch (e) { toast(e.message, 'error'); }
  });
}

function editDept(d) { openDeptModal(d); }

async function delDept(id) {
  if (!confirm('Delete this department? This may fail if it has related records.')) return;
  try { await Api.deleteDepartment(id); toast('Deleted!'); departments(); }
  catch (e) { toast(e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
//  STUDENTS
// ─────────────────────────────────────────────────────────────
async function students() {
  try {
    const data = await Api.getStudents();
    const catColors = { General:'badge-blue', OBC:'badge-olive', SC:'badge-amber', ST:'badge-brown' };
    $('#pageContent').innerHTML = `
      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-title">Students (${data.length})</div>
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search…" oninput="filterTable(this,'studTable')">
          </div>
        </div>
        <div class="table-scroll">
        <table id="studTable">
          <thead><tr>
            <th>ID</th><th>Name</th><th>Enrollment No.</th>
            <th>DOB</th><th>Gender</th><th>Category</th><th>Year</th><th>Department</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${data.length ? data.map(s => `
            <tr>
              <td><span class="mono">${s.STUDENT_ID}</span></td>
              <td><strong>${escHtml(s.FIRST_NAME)} ${escHtml(s.LAST_NAME)}</strong><br>
                <small style="color:var(--text-muted)">${escHtml(s.EMAIL)}</small></td>
              <td><span class="mono">${escHtml(s.ENROLLMENT_NUMBER)}</span></td>
              <td>${s.DATE_OF_BIRTH ? new Date(s.DATE_OF_BIRTH).toLocaleDateString('en-IN') : '—'}</td>
              <td>${escHtml(s.GENDER)}</td>
              <td><span class="badge ${catColors[s.CATEGORY]||'badge-blue'}">${escHtml(s.CATEGORY)}</span></td>
              <td>${s.ADMISSION_YEAR}</td>
              <td><span class="badge badge-olive">${escHtml(s.DEPARTMENT_NAME)}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon" onclick='editStudent(${JSON.stringify(s)})'>✏️</button>
                  <button class="btn-icon danger" onclick="delStudent(${s.STUDENT_ID})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🎓</div><p>No students found</p></div></td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    $('#addBtn').onclick = () => openStudentModal();
  } catch (e) { toast(e.message, 'error'); }
}

async function studentForm(s = {}) {
  const depts = await Api.getDepartments();
  return `<div class="form-grid">
    <div class="form-group"><label>Student ID</label><input id="f_sid" type="number" value="${s.STUDENT_ID||''}" ${s.STUDENT_ID?'disabled':''}></div>
    <div class="form-group"><label>Enrollment No.</label><input id="f_enroll" value="${escHtml(s.ENROLLMENT_NUMBER||'')}"></div>
    <div class="form-group"><label>First Name</label><input id="f_fn" value="${escHtml(s.FIRST_NAME||'')}"></div>
    <div class="form-group"><label>Last Name</label><input id="f_ln" value="${escHtml(s.LAST_NAME||'')}"></div>
    <div class="form-group full"><label>Email</label><input id="f_email" type="email" value="${escHtml(s.EMAIL||'')}"></div>
    <div class="form-group"><label>Date of Birth</label><input id="f_dob" type="date" value="${s.DATE_OF_BIRTH ? new Date(s.DATE_OF_BIRTH).toISOString().split('T')[0] : ''}"></div>
    <div class="form-group"><label>Gender</label>
      <select id="f_gender">
        ${['Male','Female','Other'].map(g => `<option ${s.GENDER===g?'selected':''}>${g}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Category</label>
      <select id="f_cat">
        ${['General','OBC','SC','ST'].map(c => `<option ${s.CATEGORY===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Admission Year</label><input id="f_yr" type="number" value="${s.ADMISSION_YEAR||new Date().getFullYear()}"></div>
    <div class="form-group"><label>Department</label>
      <select id="f_sdept">
        ${depts.map(d => `<option value="${d.DEPARTMENT_ID}" ${s.DEPARTMENT_ID===d.DEPARTMENT_ID?'selected':''}>${d.DEPARTMENT_NAME}</option>`).join('')}
      </select>
    </div>
  </div>`;
}

async function openStudentModal(s) {
  const body = await studentForm(s);
  openModal(s ? 'Edit Student' : 'Add Student', body, async () => {
    const payload = {
      student_id: +$('#f_sid').value,
      enrollment_number: $('#f_enroll').value,
      first_name: $('#f_fn').value,
      last_name: $('#f_ln').value,
      email: $('#f_email').value,
      date_of_birth: $('#f_dob').value,
      gender: $('#f_gender').value,
      category: $('#f_cat').value,
      admission_year: +$('#f_yr').value,
      department_id: +$('#f_sdept').value,
    };
    try {
      if (s) await Api.updateStudent(s.STUDENT_ID, payload);
      else await Api.addStudent(payload);
      closeModal(); toast(s ? 'Student updated!' : 'Student added!');
      students();
    } catch (e) { toast(e.message, 'error'); }
  });
}

function editStudent(s) { openStudentModal(s); }

async function delStudent(id) {
  if (!confirm('Delete this student?')) return;
  try { await Api.deleteStudent(id); toast('Deleted!'); students(); }
  catch (e) { toast(e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
//  FACULTY
// ─────────────────────────────────────────────────────────────
async function faculty() {
  try {
    const data = await Api.getFaculty();
    const desigColor = {'Professor':'badge-olive','Associate Professor':'badge-brown','Assistant Professor':'badge-blue','Associative Professor':'badge-brown'};
    $('#pageContent').innerHTML = `
      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-title">Faculty (${data.length})</div>
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search…" oninput="filterTable(this,'facTable')">
          </div>
        </div>
        <div class="table-scroll">
        <table id="facTable">
          <thead><tr>
            <th>ID</th><th>Name</th><th>Employee ID</th>
            <th>Designation</th><th>Specialization</th><th>Department</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${data.length ? data.map(f => `
            <tr>
              <td><span class="mono">${f.FACULTY_ID}</span></td>
              <td><strong>${escHtml(f.FIRST_NAME)} ${escHtml(f.LAST_NAME)}</strong><br>
                <small style="color:var(--text-muted)">${escHtml(f.EMAIL)}</small></td>
              <td><span class="mono">${escHtml(f.EMPLOYEE_ID)}</span></td>
              <td><span class="badge ${desigColor[f.DESIGNATION]||'badge-blue'}">${escHtml(f.DESIGNATION)}</span></td>
              <td>${escHtml(f.SPECIALIZATION)}</td>
              <td><span class="badge badge-olive">${escHtml(f.DEPARTMENT_NAME)}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon" onclick='editFaculty(${JSON.stringify(f)})'>✏️</button>
                  <button class="btn-icon danger" onclick="delFaculty(${f.FACULTY_ID})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">👨‍🏫</div><p>No faculty found</p></div></td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    $('#addBtn').onclick = () => openFacultyModal();
  } catch (e) { toast(e.message, 'error'); }
}

async function facultyForm(f = {}) {
  const depts = await Api.getDepartments();
  return `<div class="form-grid">
    <div class="form-group"><label>Faculty ID</label><input id="f_fid" type="number" value="${f.FACULTY_ID||''}" ${f.FACULTY_ID?'disabled':''}></div>
    <div class="form-group"><label>Employee ID</label><input id="f_eid" value="${escHtml(f.EMPLOYEE_ID||'')}"></div>
    <div class="form-group"><label>First Name</label><input id="f_fn" value="${escHtml(f.FIRST_NAME||'')}"></div>
    <div class="form-group"><label>Last Name</label><input id="f_ln" value="${escHtml(f.LAST_NAME||'')}"></div>
    <div class="form-group full"><label>Email</label><input id="f_email" type="email" value="${escHtml(f.EMAIL||'')}"></div>
    <div class="form-group"><label>Designation</label>
      <select id="f_desig">
        ${['Professor','Associate Professor','Assistant Professor'].map(d => `<option ${f.DESIGNATION===d?'selected':''}>${d}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Specialization</label><input id="f_spec" value="${escHtml(f.SPECIALIZATION||'')}"></div>
    <div class="form-group"><label>Department</label>
      <select id="f_fdept">
        ${depts.map(d => `<option value="${d.DEPARTMENT_ID}" ${f.DEPARTMENT_ID===d.DEPARTMENT_ID?'selected':''}>${d.DEPARTMENT_NAME}</option>`).join('')}
      </select>
    </div>
  </div>`;
}

async function openFacultyModal(f) {
  const body = await facultyForm(f);
  openModal(f ? 'Edit Faculty' : 'Add Faculty', body, async () => {
    const payload = {
      faculty_id: +$('#f_fid').value,
      first_name: $('#f_fn').value,
      last_name: $('#f_ln').value,
      employee_id: $('#f_eid').value,
      email: $('#f_email').value,
      designation: $('#f_desig').value,
      specialization: $('#f_spec').value,
      department_id: +$('#f_fdept').value,
    };
    try {
      if (f) await Api.updateFaculty(f.FACULTY_ID, payload);
      else await Api.addFaculty(payload);
      closeModal(); toast(f ? 'Faculty updated!' : 'Faculty added!');
      faculty();
    } catch (e) { toast(e.message, 'error'); }
  });
}

function editFaculty(f) { openFacultyModal(f); }

async function delFaculty(id) {
  if (!confirm('Delete this faculty member?')) return;
  try { await Api.deleteFaculty(id); toast('Deleted!'); faculty(); }
  catch (e) { toast(e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
//  COURSES
// ─────────────────────────────────────────────────────────────
async function courses() {
  try {
    const data = await Api.getCourses();
    $('#pageContent').innerHTML = `
      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-title">Courses (${data.length})</div>
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search…" oninput="filterTable(this,'courseTable')">
          </div>
        </div>
        <div class="table-scroll">
        <table id="courseTable">
          <thead><tr>
            <th>ID</th><th>Code</th><th>Course Name</th>
            <th>Credits</th><th>Lec Hrs</th><th>Prac Hrs</th><th>Department</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${data.length ? data.map(c => `
            <tr>
              <td><span class="mono">${c.COURSE_ID}</span></td>
              <td><span class="badge badge-olive">${escHtml(c.COURSE_CODE)}</span></td>
              <td>${escHtml(c.COURSE_NAME)}<br>
                <small style="color:var(--text-muted);font-size:.72rem">${escHtml(c.DESCRIPTION||'').substring(0,60)}${c.DESCRIPTION?.length>60?'…':''}</small></td>
              <td><strong>${c.CREDITS}</strong></td>
              <td>${c.LECTURE_HOURS}</td>
              <td>${c.PRACTICAL_HOURS}</td>
              <td>${escHtml(c.DEPARTMENT_NAME)}</td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon" onclick='editCourse(${JSON.stringify(c)})'>✏️</button>
                  <button class="btn-icon danger" onclick="delCourse(${c.COURSE_ID})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📚</div><p>No courses found</p></div></td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    $('#addBtn').onclick = () => openCourseModal();
  } catch (e) { toast(e.message, 'error'); }
}

async function courseForm(c = {}) {
  const depts = await Api.getDepartments();
  return `<div class="form-grid">
    <div class="form-group"><label>Course ID</label><input id="f_cid" type="number" value="${c.COURSE_ID||''}" ${c.COURSE_ID?'disabled':''}></div>
    <div class="form-group"><label>Course Code</label><input id="f_ccode" value="${escHtml(c.COURSE_CODE||'')}"></div>
    <div class="form-group full"><label>Course Name</label><input id="f_cname" value="${escHtml(c.COURSE_NAME||'')}"></div>
    <div class="form-group full"><label>Description</label><textarea id="f_cdesc">${escHtml(c.DESCRIPTION||'')}</textarea></div>
    <div class="form-group"><label>Credits (1–5)</label><input id="f_ccred" type="number" min="1" max="5" value="${c.CREDITS||3}"></div>
    <div class="form-group"><label>Lecture Hours</label><input id="f_clec" type="number" value="${c.LECTURE_HOURS||3}"></div>
    <div class="form-group"><label>Practical Hours</label><input id="f_cprac" type="number" value="${c.PRACTICAL_HOURS||2}"></div>
    <div class="form-group"><label>Department</label>
      <select id="f_cdept">
        ${depts.map(d => `<option value="${d.DEPARTMENT_ID}" ${c.DEPARTMENT_ID===d.DEPARTMENT_ID?'selected':''}>${d.DEPARTMENT_NAME}</option>`).join('')}
      </select>
    </div>
  </div>`;
}

async function openCourseModal(c) {
  const body = await courseForm(c);
  openModal(c ? 'Edit Course' : 'Add Course', body, async () => {
    const payload = {
      course_id: +$('#f_cid').value,
      course_code: $('#f_ccode').value,
      course_name: $('#f_cname').value,
      description: $('#f_cdesc').value,
      credits: +$('#f_ccred').value,
      lecture_hours: +$('#f_clec').value,
      practical_hours: +$('#f_cprac').value,
      department_id: +$('#f_cdept').value,
    };
    try {
      if (c) await Api.updateCourse(c.COURSE_ID, payload);
      else await Api.addCourse(payload);
      closeModal(); toast(c ? 'Course updated!' : 'Course added!');
      courses();
    } catch (e) { toast(e.message, 'error'); }
  });
}

function editCourse(c) { openCourseModal(c); }

async function delCourse(id) {
  if (!confirm('Delete this course?')) return;
  try { await Api.deleteCourse(id); toast('Deleted!'); courses(); }
  catch (e) { toast(e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
//  SEMESTERS
// ─────────────────────────────────────────────────────────────
async function semesters() {
  try {
    const data = await Api.getSemesters();
    $('#pageContent').innerHTML = `
      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-title">Semesters (${data.length})</div>
        </div>
        <div class="table-scroll">
        <table id="semTable">
          <thead><tr>
            <th>ID</th><th>Semester</th><th>Academic Year</th>
            <th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${data.length ? data.map(s => `
            <tr>
              <td><span class="mono">${s.SEMESTER_ID}</span></td>
              <td><strong>${escHtml(s.SEMESTER_NAME)}</strong></td>
              <td>${escHtml(s.ACADEMIC_YEAR)}</td>
              <td>${s.START_DATE ? new Date(s.START_DATE).toLocaleDateString('en-IN') : '—'}</td>
              <td>${s.END_DATE ? new Date(s.END_DATE).toLocaleDateString('en-IN') : '—'}</td>
              <td><span class="badge ${s.IS_CURRENT ? 'badge-green' : 'badge-amber'}">${s.IS_CURRENT ? 'Current' : 'Past'}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon" onclick='editSemester(${JSON.stringify(s)})'>✏️</button>
                  <button class="btn-icon danger" onclick="delSemester(${s.SEMESTER_ID})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📅</div><p>No semesters found</p></div></td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    $('#addBtn').onclick = () => openSemesterModal();
  } catch (e) { toast(e.message, 'error'); }
}

function semesterForm(s = {}) {
  return `<div class="form-grid">
    <div class="form-group"><label>Semester ID</label><input id="f_semid" type="number" value="${s.SEMESTER_ID||''}" ${s.SEMESTER_ID?'disabled':''}></div>
    <div class="form-group"><label>Semester Name</label><input id="f_semname" value="${escHtml(s.SEMESTER_NAME||'')}"></div>
    <div class="form-group"><label>Academic Year (e.g. 2024-25)</label><input id="f_semyr" value="${escHtml(s.ACADEMIC_YEAR||'')}"></div>
    <div class="form-group"><label>Is Current</label>
      <select id="f_semcur">
        <option value="0" ${!s.IS_CURRENT?'selected':''}>No</option>
        <option value="1" ${s.IS_CURRENT?'selected':''}>Yes</option>
      </select>
    </div>
    <div class="form-group"><label>Start Date</label><input id="f_semstart" type="date" value="${s.START_DATE ? new Date(s.START_DATE).toISOString().split('T')[0] : ''}"></div>
    <div class="form-group"><label>End Date</label><input id="f_semend" type="date" value="${s.END_DATE ? new Date(s.END_DATE).toISOString().split('T')[0] : ''}"></div>
  </div>`;
}

function openSemesterModal(s) {
  openModal(s ? 'Edit Semester' : 'Add Semester', semesterForm(s), async () => {
    const payload = {
      semester_id: +$('#f_semid').value,
      semester_name: $('#f_semname').value,
      academic_year: $('#f_semyr').value,
      start_date: $('#f_semstart').value,
      end_date: $('#f_semend').value,
      is_current: +$('#f_semcur').value,
    };
    try {
      if (s) await Api.updateSemester(s.SEMESTER_ID, payload);
      else await Api.addSemester(payload);
      closeModal(); toast(s ? 'Semester updated!' : 'Semester added!');
      semesters();
    } catch (e) { toast(e.message, 'error'); }
  });
}

function editSemester(s) { openSemesterModal(s); }

async function delSemester(id) {
  if (!confirm('Delete this semester?')) return;
  try { await Api.deleteSemester(id); toast('Deleted!'); semesters(); }
  catch (e) { toast(e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
//  COURSE OFFERINGS
// ─────────────────────────────────────────────────────────────
async function offerings() {
  try {
    const data = await Api.getOfferings();
    $('#pageContent').innerHTML = `
      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-title">Course Offerings (${data.length})</div>
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search…" oninput="filterTable(this,'offTable')">
          </div>
        </div>
        <div class="table-scroll">
        <table id="offTable">
          <thead><tr>
            <th>ID</th><th>Course</th><th>Semester</th>
            <th>Faculty</th><th>Section</th><th>Max</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${data.length ? data.map(o => `
            <tr>
              <td><span class="mono">${o.OFFERING_ID}</span></td>
              <td><span class="badge badge-olive">${escHtml(o.COURSE_CODE)}</span> ${escHtml(o.COURSE_NAME)}</td>
              <td>${escHtml(o.SEMESTER_NAME)}</td>
              <td>${escHtml(o.FACULTY_NAME)}</td>
              <td><span class="badge badge-brown">${escHtml(o.SECTION)}</span></td>
              <td>${o.MAX_STRENGTH}</td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon" onclick='editOffering(${JSON.stringify(o)})'>✏️</button>
                  <button class="btn-icon danger" onclick="delOffering(${o.OFFERING_ID})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">⏰</div><p>No offerings found</p></div></td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    $('#addBtn').onclick = () => openOfferingModal();
  } catch (e) { toast(e.message, 'error'); }
}

async function offeringForm(o = {}) {
  const [cs, sems, facs] = await Promise.all([Api.getCourses(), Api.getSemesters(), Api.getFaculty()]);
  return `<div class="form-grid">
    <div class="form-group"><label>Offering ID</label><input id="f_oid" type="number" value="${o.OFFERING_ID||''}" ${o.OFFERING_ID?'disabled':''}></div>
    <div class="form-group"><label>Section</label><input id="f_osec" value="${escHtml(o.SECTION||'A')}"></div>
    <div class="form-group full"><label>Course</label>
      <select id="f_ocourse">
        ${cs.map(c => `<option value="${c.COURSE_ID}" ${o.COURSE_ID===c.COURSE_ID?'selected':''}>${c.COURSE_CODE} — ${c.COURSE_NAME}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Semester</label>
      <select id="f_osem">
        ${sems.map(s => `<option value="${s.SEMESTER_ID}" ${o.SEMESTER_ID===s.SEMESTER_ID?'selected':''}>${s.SEMESTER_NAME} (${s.ACADEMIC_YEAR})</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Faculty</label>
      <select id="f_ofac">
        ${facs.map(f => `<option value="${f.FACULTY_ID}" ${o.FACULTY_ID===f.FACULTY_ID?'selected':''}>${f.FIRST_NAME} ${f.LAST_NAME}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Max Strength</label><input id="f_omax" type="number" value="${o.MAX_STRENGTH||60}"></div>
  </div>`;
}

async function openOfferingModal(o) {
  const body = await offeringForm(o);
  openModal(o ? 'Edit Offering' : 'Add Offering', body, async () => {
    const payload = {
      offering_id: +$('#f_oid').value,
      course_id: +$('#f_ocourse').value,
      semester_id: +$('#f_osem').value,
      faculty_id: +$('#f_ofac').value,
      section: $('#f_osec').value,
      max_strength: +$('#f_omax').value,
    };
    try {
      if (o) await Api.updateOffering(o.OFFERING_ID, payload);
      else await Api.addOffering(payload);
      closeModal(); toast(o ? 'Offering updated!' : 'Offering added!');
      offerings();
    } catch (e) { toast(e.message, 'error'); }
  });
}

function editOffering(o) { openOfferingModal(o); }

async function delOffering(id) {
  if (!confirm('Delete this offering?')) return;
  try { await Api.deleteOffering(id); toast('Deleted!'); offerings(); }
  catch (e) { toast(e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
//  ENROLLMENTS
// ─────────────────────────────────────────────────────────────
async function enrollments() {
  try {
    const data = await Api.getEnrollments();
    const statusColor = { Registered:'badge-green', Completed:'badge-blue', Dropped:'badge-red' };
    $('#pageContent').innerHTML = `
      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-title">Enrollments (${data.length})</div>
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search…" oninput="filterTable(this,'enrollTable')">
          </div>
        </div>
        <div class="table-scroll">
        <table id="enrollTable">
          <thead><tr>
            <th>ID</th><th>Student</th><th>Course</th>
            <th>Semester</th><th>Date</th><th>Status</th><th>Marks</th><th>Grade</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${data.length ? data.map(e => `
            <tr>
              <td><span class="mono">${e.ENROLLMENT_ID}</span></td>
              <td>${escHtml(e.STUDENT_NAME)}</td>
              <td>${escHtml(e.COURSE_NAME)}</td>
              <td>${escHtml(e.SEMESTER_NAME)}</td>
              <td>${e.ENROLLMENT_DATE ? new Date(e.ENROLLMENT_DATE).toLocaleDateString('en-IN') : '—'}</td>
              <td><span class="badge ${statusColor[e.STATUS]||'badge-blue'}">${escHtml(e.STATUS)}</span></td>
              <td>${e.MARKS_OBTAINED ?? '—'}</td>
              <td>${e.GRADE ? `<span class="badge badge-olive">${e.GRADE}</span>` : '—'}</td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon" onclick='editEnrollment(${JSON.stringify(e)})'>✏️</button>
                  <button class="btn-icon danger" onclick="delEnrollment(${e.ENROLLMENT_ID})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📋</div><p>No enrollments found</p></div></td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    $('#addBtn').onclick = () => openEnrollmentModal();
  } catch (e) { toast(e.message, 'error'); }
}

async function enrollmentForm(e = {}) {
  const [studs, offs] = await Promise.all([Api.getStudents(), Api.getOfferings()]);
  return `<div class="form-grid">
    <div class="form-group"><label>Enrollment ID</label><input id="f_eid2" type="number" value="${e.ENROLLMENT_ID||''}" ${e.ENROLLMENT_ID?'disabled':''}></div>
    <div class="form-group"><label>Enrollment Date</label><input id="f_edate" type="date" value="${e.ENROLLMENT_DATE ? new Date(e.ENROLLMENT_DATE).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}"></div>
    <div class="form-group full"><label>Student</label>
      <select id="f_estud">
        ${studs.map(s => `<option value="${s.STUDENT_ID}" ${e.STUDENT_ID===s.STUDENT_ID?'selected':''}>${s.FIRST_NAME} ${s.LAST_NAME} (${s.ENROLLMENT_NUMBER})</option>`).join('')}
      </select>
    </div>
    <div class="form-group full"><label>Offering</label>
      <select id="f_eoff">
        ${offs.map(o => `<option value="${o.OFFERING_ID}" ${e.OFFERING_ID===o.OFFERING_ID?'selected':''}>${o.COURSE_CODE} — ${o.COURSE_NAME} — Sec ${o.SECTION} — ${o.SEMESTER_NAME}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Status</label>
      <select id="f_estat">
        ${['Registered','Completed','Dropped'].map(st => `<option ${e.STATUS===st?'selected':''}>${st}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Marks (0–100)</label><input id="f_emarks" type="number" min="0" max="100" value="${e.MARKS_OBTAINED??''}"></div>
    <div class="form-group"><label>Grade</label><input id="f_egrade" value="${escHtml(e.GRADE||'')}"></div>
  </div>`;
}

async function openEnrollmentModal(e) {
  const body = await enrollmentForm(e);
  openModal(e ? 'Edit Enrollment' : 'Add Enrollment', body, async () => {
    const payload = {
      enrollment_id: +$('#f_eid2').value,
      student_id: +$('#f_estud').value,
      offering_id: +$('#f_eoff').value,
      enrollment_date: $('#f_edate').value,
      status: $('#f_estat').value,
      marks_obtained: $('#f_emarks').value || null,
      grade: $('#f_egrade').value || null,
    };
    try {
      if (e) await Api.updateEnrollment(e.ENROLLMENT_ID, payload);
      else await Api.addEnrollment(payload);
      closeModal(); toast(e ? 'Enrollment updated!' : 'Enrollment added!');
      enrollments();
    } catch (err) { toast(err.message, 'error'); }
  });
}

function editEnrollment(e) { openEnrollmentModal(e); }

async function delEnrollment(id) {
  if (!confirm('Delete this enrollment?')) return;
  try { await Api.deleteEnrollment(id); toast('Deleted!'); enrollments(); }
  catch (e) { toast(e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
//  PAYMENTS
// ─────────────────────────────────────────────────────────────
async function payments() {
  try {
    const data = await Api.getPayments();
    const statusColor = { Completed:'badge-green', Pending:'badge-amber', Failed:'badge-red' };
    const modeIcon = { UPI:'📱', 'Net Banking':'🏦', 'Debit Card':'💳', Cash:'💵' };
    $('#pageContent').innerHTML = `
      <div class="table-wrapper">
        <div class="table-header">
          <div class="table-title">Fee Payments (${data.length})</div>
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search…" oninput="filterTable(this,'payTable')">
          </div>
        </div>
        <div class="table-scroll">
        <table id="payTable">
          <thead><tr>
            <th>ID</th><th>Student</th><th>Transaction ID</th>
            <th>Fee Type</th><th>Amount</th><th>Date</th><th>Mode</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
          ${data.length ? data.map(p => `
            <tr>
              <td><span class="mono">${p.PAYMENT_ID}</span></td>
              <td>${escHtml(p.STUDENT_NAME)}</td>
              <td><span class="mono">${escHtml(p.TRANSACTION_ID)}</span></td>
              <td>${escHtml(p.FEE_TYPE)}</td>
              <td><strong>₹${Number(p.AMOUNT).toLocaleString('en-IN')}</strong></td>
              <td>${p.PAYMENT_DATE ? new Date(p.PAYMENT_DATE).toLocaleDateString('en-IN') : '—'}</td>
              <td>${modeIcon[p.PAYMENT_MODE]||''} ${escHtml(p.PAYMENT_MODE)}</td>
              <td><span class="badge ${statusColor[p.STATUS]||'badge-blue'}">${escHtml(p.STATUS)}</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon" onclick='editPayment(${JSON.stringify(p)})'>✏️</button>
                  <button class="btn-icon danger" onclick="delPayment(${p.PAYMENT_ID})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">💳</div><p>No payments found</p></div></td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
    $('#addBtn').onclick = () => openPaymentModal();
  } catch (e) { toast(e.message, 'error'); }
}

async function paymentForm(p = {}) {
  const studs = await Api.getStudents();
  return `<div class="form-grid">
    <div class="form-group"><label>Payment ID</label><input id="f_pid" type="number" value="${p.PAYMENT_ID||''}" ${p.PAYMENT_ID?'disabled':''}></div>
    <div class="form-group"><label>Transaction ID</label><input id="f_txn" value="${escHtml(p.TRANSACTION_ID||'')}"></div>
    <div class="form-group full"><label>Student</label>
      <select id="f_pstud">
        ${studs.map(s => `<option value="${s.STUDENT_ID}" ${p.STUDENT_ID===s.STUDENT_ID?'selected':''}>${s.FIRST_NAME} ${s.LAST_NAME} (${s.ENROLLMENT_NUMBER})</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Fee Type</label>
      <select id="f_ftype">
        ${['Tuition Fee','Hostel Fee','Examination Fee','Library Fee','Other'].map(t => `<option ${p.FEE_TYPE===t?'selected':''}>${t}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Amount (₹)</label><input id="f_pamount" type="number" min="1" step="0.01" value="${p.AMOUNT||''}"></div>
    <div class="form-group"><label>Payment Mode</label>
      <select id="f_pmode">
        ${['UPI','Net Banking','Debit Card','Cash'].map(m => `<option ${p.PAYMENT_MODE===m?'selected':''}>${m}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Status</label>
      <select id="f_pstat">
        ${['Completed','Pending','Failed'].map(st => `<option ${p.STATUS===st?'selected':''}>${st}</option>`).join('')}
      </select>
    </div>
  </div>`;
}

async function openPaymentModal(p) {
  const body = await paymentForm(p);
  openModal(p ? 'Edit Payment' : 'Add Payment', body, async () => {
    const payload = {
      payment_id: +$('#f_pid').value,
      student_id: +$('#f_pstud').value,
      transaction_id: $('#f_txn').value,
      fee_type: $('#f_ftype').value,
      amount: +$('#f_pamount').value,
      payment_mode: $('#f_pmode').value,
      status: $('#f_pstat').value,
    };
    try {
      if (p) await Api.updatePayment(p.PAYMENT_ID, payload);
      else await Api.addPayment(payload);
      closeModal(); toast(p ? 'Payment updated!' : 'Payment recorded!');
      payments();
    } catch (e) { toast(e.message, 'error'); }
  });
}

function editPayment(p) { openPaymentModal(p); }

async function delPayment(id) {
  if (!confirm('Delete this payment record?')) return;
  try { await Api.deletePayment(id); toast('Deleted!'); payments(); }
  catch (e) { toast(e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────
navigate('dashboard');
checkDbStatus();
