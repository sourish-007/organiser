import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import yearRoutes from './src/routes/yearRoutes.js';
import monthRoutes from './src/routes/monthRoutes.js';
import subjectRoutes from './src/routes/subjectRoutes.js';
import topicRoutes from './src/routes/topicRoutes.js';
import essayPointerRoutes from './src/routes/essayPointerRoutes.js';
import dbCheck from './src/middleware/dbCheckMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(dbCheck);

app.use('/api/auth', authRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/months', monthRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/essay-pointers', essayPointerRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
