import express from 'express';
import doctorRoutes from './routes/doctor.js';

const app = express();

// ...existing code...

app.use('/api', doctorRoutes);

// ...existing code...

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
