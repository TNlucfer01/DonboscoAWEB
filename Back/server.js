require('./src/config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./src/config/db');

const app = express();
// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/semesters', require('./src/routes/semester.routes'));

app.use('/api/batches', require('./src/routes/batch.routes'));
app.use('/api/subjects', require('./src/routes/subject.routes'));
app.use('/api/students', require('./src/routes/student.routes'));
app.use('/api/attendance', require('./src/routes/attendance.routes'));
app.use('/api/calendar', require('./src/routes/calendar.routes'));
app.use('/api/audit', require('./src/routes/audit.routes'));
app.use('/api/reports', require('./src/routes/report.routes'));

// ── Global Error Handler ─────────────────────────────────────
app.use(require('./src/middleware/errorHandler'));

// ── Scheduled Jobs ────────────────────────────────────────────
require('./src/jobs/monthlyWarning.job');

// ── DB + Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;

sequelize.authenticate()
  .then(() => console.log('✔ DB connected'))
  .catch(err => { console.error('✘ DB connection failed:', err.message); process.exit(1); });

sequelize.sync({ force: false })
  .then(() => {
    console.log('✔ Tables synced');
    app.listen(PORT, () => console.log(`✔ Server running on port ${PORT}`));
  })
  .catch(err => console.error('✘ Sync failed:', err.message));
