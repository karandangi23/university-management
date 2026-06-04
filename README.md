# 🎓 Univera — University Management System
### by Karan Dangi

A full-stack University Management System with:
- **Frontend**: Vanilla HTML/CSS/JS (white, brown, olive green theme)
- **Backend**: Node.js + Express
- **Database**: Oracle DB (your existing schema)

---

## 📁 Project Structure

```
university-mgmt/
├── backend/
│   └── server.js          ← Express API server
├── config/
│   └── db.config.js       ← Oracle connection settings ← EDIT THIS
├── public/
│   ├── index.html         ← Main SPA shell
│   ├── css/
│   │   └── style.css      ← All styles
│   └── js/
│       ├── api.js         ← API fetch helpers
│       └── app.js         ← All page logic (router, CRUD, modals)
├── package.json
└── README.md
```

---

## ⚙️ Setup

### 1. Install Dependencies
```bash
cd university-mgmt
npm install
```

### 2. Configure Oracle Connection
Edit `config/db.config.js`:
```js
module.exports = {
  user: 'SYSTEM',             // your Oracle username
  password: 'YourPassword',   // your Oracle password
  connectString: 'localhost/XEPDB1',  // host/service name
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
};
```

**Common connectString values:**
| Setup | connectString |
|---|---|
| Oracle XE local | `localhost/XEPDB1` |
| Oracle 19c/21c | `localhost/ORCLPDB1` |
| Oracle XE (old) | `localhost/XE` |
| Oracle Cloud ADB | See wallet / connection string from Oracle Cloud |

You can also use environment variables:
```bash
DB_USER=SYSTEM DB_PASS=mypassword DB_CONNECT=localhost/XEPDB1 npm start
```

### 3. Make Sure Oracle Instant Client is Installed
`oracledb` requires Oracle Instant Client.
- Download from: https://www.oracle.com/database/technologies/instant-client/downloads.html
- Or if you have full Oracle DB installed, it's already available.

### 4. Create Tables & Insert Data
Run your Oracle SQL script (the one you already have) in SQL*Plus or SQL Developer to create all 7 tables and populate them.

### 5. Start the Server
```bash
npm start
# or for dev with auto-reload:
npm run dev
```

Visit: **http://localhost:3000**

---

## 📊 Features

| Module | List | Add | Edit | Delete | Search |
|---|---|---|---|---|---|
| Departments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Students | ✅ | ✅ | ✅ | ✅ | ✅ |
| Faculty | ✅ | ✅ | ✅ | ✅ | ✅ |
| Courses | ✅ | ✅ | ✅ | ✅ | ✅ |
| Semesters | ✅ | ✅ | ✅ | ✅ | — |
| Course Offerings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enrollments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fee Payments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard Stats | ✅ | — | — | — | — |

---

## 🛠️ Troubleshooting

| Error | Fix |
|---|---|
| `DPI-1047: Cannot locate a 64-bit Oracle Client library` | Install Oracle Instant Client and set `LD_LIBRARY_PATH` (Linux) or `PATH` (Windows) |
| `ORA-01017: invalid username/password` | Check `db.config.js` credentials |
| `ORA-12541: no listener` | Make sure Oracle DB / listener is running |
| Port 3000 in use | Set `PORT=3001 npm start` |

---

## 🎨 Theme

Colors used:
- **Ivory** `#FAF6EF` — backgrounds
- **Deep Brown** `#3D2B1F` — sidebar, headings  
- **Olive Green** `#6B7355` — accents, active states
- **Brown Pale** `#C4956A` — badges, highlights
