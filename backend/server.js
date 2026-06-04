const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: 'C:\\oraclexe\\app\\oracle\\product\\11.2.0\\server\\bin' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const dbConfig = require('../config/db.config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ─── Oracle Pool Init ───────────────────────────────────────────────────────
async function initDB() {
  await oracledb.createPool(dbConfig);
  console.log('✅ Oracle connection pool created');
}

// ─── Helper ─────────────────────────────────────────────────────────────────
async function query(sql, binds = [], opts = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    opts.outFormat = oracledb.OUT_FORMAT_OBJECT;
    const result = await conn.execute(sql, binds, opts);
    return result;
  } finally {
    if (conn) await conn.close();
  }
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// DEPARTMENTS
app.get('/api/departments', async (req, res) => {
  try {
    const r = await query('SELECT * FROM Department ORDER BY department_id');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/departments', async (req, res) => {
  const { department_id, department_name, department_code, hod_name, phone_number } = req.body;
  try {
    await query(
      'INSERT INTO Department VALUES (:1,:2,:3,:4,:5)',
      [department_id, department_name, department_code, hod_name, phone_number],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/departments/:id', async (req, res) => {
  const { department_name, department_code, hod_name, phone_number } = req.body;
  try {
    await query(
      'UPDATE Department SET department_name=:1, department_code=:2, hod_name=:3, phone_number=:4 WHERE department_id=:5',
      [department_name, department_code, hod_name, phone_number, req.params.id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/departments/:id', async (req, res) => {
  try {
    await query('DELETE FROM Department WHERE department_id=:1', [req.params.id], { autoCommit: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// STUDENTS
app.get('/api/students', async (req, res) => {
  try {
    const r = await query(`SELECT s.*, d.department_name FROM Student s 
      JOIN Department d ON s.department_id = d.department_id ORDER BY s.student_id`);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/students', async (req, res) => {
  const { student_id, enrollment_number, first_name, last_name, email, date_of_birth, gender, category, admission_year, department_id } = req.body;
  try {
    await query(
      `INSERT INTO Student (student_id, first_name, last_name, enrollment_number, date_of_birth, email, gender, category, admission_year, department_id)
       VALUES (:1,:2,:3,:4,TO_DATE(:5,'YYYY-MM-DD'),:6,:7,:8,:9,:10)`,
      [student_id, first_name, last_name, enrollment_number, date_of_birth, email, gender, category, admission_year, department_id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/students/:id', async (req, res) => {
  const { first_name, last_name, enrollment_number, email, gender, category, admission_year, department_id } = req.body;
  try {
    await query(
      `UPDATE Student SET first_name=:1, last_name=:2, enrollment_number=:3, email=:4, gender=:5, category=:6, admission_year=:7, department_id=:8 WHERE student_id=:9`,
      [first_name, last_name, enrollment_number, email, gender, category, admission_year, department_id, req.params.id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/students/:id', async (req, res) => {
  try {
    await query('DELETE FROM Student WHERE student_id=:1', [req.params.id], { autoCommit: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// FACULTY
app.get('/api/faculty', async (req, res) => {
  try {
    const r = await query(`SELECT f.*, d.department_name FROM Faculty f 
      JOIN Department d ON f.department_id = d.department_id ORDER BY f.faculty_id`);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/faculty', async (req, res) => {
  const { faculty_id, first_name, last_name, employee_id, email, designation, specialization, department_id } = req.body;
  try {
    await query(
      'INSERT INTO Faculty VALUES (:1,:2,:3,:4,:5,:6,:7,:8)',
      [faculty_id, first_name, last_name, employee_id, email, designation, specialization, department_id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/faculty/:id', async (req, res) => {
  const { first_name, last_name, employee_id, email, designation, specialization, department_id } = req.body;
  try {
    await query(
      `UPDATE Faculty SET first_name=:1, last_name=:2, employee_id=:3, email=:4, designation=:5, specialization=:6, department_id=:7 WHERE faculty_id=:8`,
      [first_name, last_name, employee_id, email, designation, specialization, department_id, req.params.id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/faculty/:id', async (req, res) => {
  try {
    await query('DELETE FROM Faculty WHERE faculty_id=:1', [req.params.id], { autoCommit: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// COURSES
app.get('/api/courses', async (req, res) => {
  try {
    const r = await query(`SELECT c.*, d.department_name FROM Course c 
      JOIN Department d ON c.department_id = d.department_id ORDER BY c.course_id`);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/courses', async (req, res) => {
  const { course_id, course_code, course_name, description, credits, lecture_hours, practical_hours, department_id } = req.body;
  try {
    await query(
      'INSERT INTO Course VALUES (:1,:2,:3,:4,:5,:6,:7,:8)',
      [course_id, course_code, course_name, description, credits, lecture_hours, practical_hours, department_id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/courses/:id', async (req, res) => {
  const { course_code, course_name, description, credits, lecture_hours, practical_hours, department_id } = req.body;
  try {
    await query(
      `UPDATE Course SET course_code=:1, course_name=:2, description=:3, credits=:4, lecture_hours=:5, practical_hours=:6, department_id=:7 WHERE course_id=:8`,
      [course_code, course_name, description, credits, lecture_hours, practical_hours, department_id, req.params.id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/courses/:id', async (req, res) => {
  try {
    await query('DELETE FROM Course WHERE course_id=:1', [req.params.id], { autoCommit: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SEMESTERS
app.get('/api/semesters', async (req, res) => {
  try {
    const r = await query('SELECT * FROM Semester ORDER BY semester_id');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/semesters', async (req, res) => {
  const { semester_id, semester_name, academic_year, start_date, end_date, is_current } = req.body;
  try {
    await query(
      `INSERT INTO Semester (semester_id, semester_name, academic_year, start_date, end_date, is_current)
       VALUES (:1,:2,:3,TO_DATE(:4,'YYYY-MM-DD'),TO_DATE(:5,'YYYY-MM-DD'),:6)`,
      [semester_id, semester_name, academic_year, start_date, end_date, is_current],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/semesters/:id', async (req, res) => {
  const { semester_name, academic_year, start_date, end_date, is_current } = req.body;
  try {
    await query(
      `UPDATE Semester SET semester_name=:1, academic_year=:2, start_date=TO_DATE(:3,'YYYY-MM-DD'), end_date=TO_DATE(:4,'YYYY-MM-DD'), is_current=:5 WHERE semester_id=:6`,
      [semester_name, academic_year, start_date, end_date, is_current, req.params.id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/semesters/:id', async (req, res) => {
  try {
    await query('DELETE FROM Semester WHERE semester_id=:1', [req.params.id], { autoCommit: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// COURSE OFFERINGS
app.get('/api/offerings', async (req, res) => {
  try {
    const r = await query(`SELECT co.*, c.course_name, c.course_code, s.semester_name, f.first_name||' '||f.last_name AS faculty_name
      FROM Course_Offering co
      JOIN Course c ON co.course_id = c.course_id
      JOIN Semester s ON co.semester_id = s.semester_id
      JOIN Faculty f ON co.faculty_id = f.faculty_id
      ORDER BY co.offering_id`);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/enrollments', async (req, res) => {
  const { enrollment_id, student_id, offering_id, enrollment_date, status, marks_obtained, grade } = req.body;
  try {
    await query(
      `INSERT INTO Enrollment (enrollment_id, student_id, offering_id, enrollment_date, status, marks_obtained, grade)
       VALUES (:1,:2,:3,TO_DATE(:4,'YYYY-MM-DD'),:5,:6,:7)`,
      [enrollment_id, student_id, offering_id, enrollment_date, status, marks_obtained || null, grade || null],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/offerings/:id', async (req, res) => {
  const { course_id, semester_id, faculty_id, section, max_strength } = req.body;
  try {
    await query(
      `UPDATE Course_Offering SET course_id=:1, semester_id=:2, faculty_id=:3, section=:4, max_strength=:5 WHERE offering_id=:6`,
      [course_id, semester_id, faculty_id, section, max_strength, req.params.id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/offerings/:id', async (req, res) => {
  try {
    await query('DELETE FROM Course_Offering WHERE offering_id=:1', [req.params.id], { autoCommit: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ENROLLMENTS
app.get('/api/enrollments', async (req, res) => {
  try {
    const r = await query(`SELECT e.*, s.first_name||' '||s.last_name AS student_name, c.course_name, sem.semester_name
      FROM Enrollment e
      JOIN Student s ON e.student_id = s.student_id
      JOIN Course_Offering co ON e.offering_id = co.offering_id
      JOIN Course c ON co.course_id = c.course_id
      JOIN Semester sem ON co.semester_id = sem.semester_id
      ORDER BY e.enrollment_id`);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/enrollments', async (req, res) => {
  const { enrollment_id, student_id, offering_id, enrollment_date, status, marks_obtained, grade } = req.body;
  try {
    await query(
      `INSERT INTO Enrollment VALUES (:1,:2,:3,DATE :4,:5,:6,:7)`,
      [enrollment_id, student_id, offering_id, enrollment_date, status, marks_obtained || null, grade || null],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/enrollments/:id', async (req, res) => {
  const { status, marks_obtained, grade } = req.body;
  try {
    await query(
      `UPDATE Enrollment SET status=:1, marks_obtained=:2, grade=:3 WHERE enrollment_id=:4`,
      [status, marks_obtained || null, grade || null, req.params.id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/enrollments/:id', async (req, res) => {
  try {
    await query('DELETE FROM Enrollment WHERE enrollment_id=:1', [req.params.id], { autoCommit: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// FEE PAYMENTS
app.get('/api/payments', async (req, res) => {
  try {
    const r = await query(`SELECT fp.*, s.first_name||' '||s.last_name AS student_name
      FROM Fee_Payment fp
      JOIN Student s ON fp.student_id = s.student_id
      ORDER BY fp.payment_id`);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/payments', async (req, res) => {
  const { payment_id, student_id, transaction_id, fee_type, amount, payment_mode, status } = req.body;
  try {
    await query(
      `INSERT INTO Fee_Payment(payment_id, student_id, transaction_id, fee_type, amount, payment_date, payment_mode, status)
       VALUES (:1,:2,:3,:4,:5,SYSTIMESTAMP,:6,:7)`,
      [payment_id, student_id, transaction_id, fee_type, amount, payment_mode, status],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/payments/:id', async (req, res) => {
  const { fee_type, amount, payment_mode, status } = req.body;
  try {
    await query(
      `UPDATE Fee_Payment SET fee_type=:1, amount=:2, payment_mode=:3, status=:4 WHERE payment_id=:5`,
      [fee_type, amount, payment_mode, status, req.params.id],
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/payments/:id', async (req, res) => {
  try {
    await query('DELETE FROM Fee_Payment WHERE payment_id=:1', [req.params.id], { autoCommit: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DASHBOARD STATS
app.get('/api/stats', async (req, res) => {
  try {
    const [students, faculty, courses, payments, enrollments] = await Promise.all([
      query('SELECT COUNT(*) AS CNT FROM Student'),
      query('SELECT COUNT(*) AS CNT FROM Faculty'),
      query('SELECT COUNT(*) AS CNT FROM Course'),
      query('SELECT NVL(SUM(amount),0) AS TOTAL FROM Fee_Payment WHERE status=\'Completed\''),
      query('SELECT COUNT(*) AS CNT FROM Enrollment WHERE status=\'Registered\''),
    ]);
    res.json({
      students: students.rows[0].CNT,
      faculty: faculty.rows[0].CNT,
      courses: courses.rows[0].CNT,
      revenue: payments.rows[0].TOTAL,
      activeEnrollments: enrollments.rows[0].CNT,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Serve index for any non-api route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`🎓 University Portal running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ DB Init failed:', err);
  process.exit(1);
});
