require('./src/config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const sequelize = require('./src/config/db');

const app = express();
// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
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
app.use('/api/attendance-summary', require('./src/routes/attendanceSummary.routes'));
app.use('/api/monthly-register', require('./src/routes/monthlyRegister.routes'));

// ── Swagger UI ────────────────────────────────────────────────
const swaggerUi = require('swagger-ui-express');
let swaggerFile;
try {
  swaggerFile = require('./swagger_output.json');
} catch (err) {
  swaggerFile = { info: { title: 'Not Generated Yet', description: 'Run npm run swagger-autogen' } };
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

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
