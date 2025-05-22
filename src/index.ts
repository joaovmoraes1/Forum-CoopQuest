import express from 'express';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});