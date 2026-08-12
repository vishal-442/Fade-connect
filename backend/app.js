const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const salonRoutes = require('./routes/salonRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const workerRoutes = require('./routes/workerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'fade-connect-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(errorHandler);

module.exports = app;
