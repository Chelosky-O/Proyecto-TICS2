require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');

const { sequelize, Role, User } = require('./models');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(auth);

/* ----- Rutas ----- */
app.use('/api/auth',   require('./routes/auth.routes'));
app.use('/api/tasks',  require('./routes/task.routes'));
app.use('/api/users',  require('./routes/user.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.get('/api/health', (_, res) => res.json({ ok: true }));

/* ----- Bootstrap DB + seed ----- */
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const [solicitante] = await Role.findOrCreate({ where: { name: 'solicitante' } });
    const [sg]          = await Role.findOrCreate({ where: { name: 'sg' } });
    const [adminRole]   = await Role.findOrCreate({ where: { name: 'admin' } });

    const adminEmail = 'admin@vidacel.local';
    const exists = await User.findOne({ where: { email: adminEmail } });
    if (!exists) {
      await User.create({
        name:     'Administrador',
        email:    adminEmail,
        password: bcrypt.hashSync('admin123', 10),
        area:     'Gerencia',
        RoleId:   adminRole.id
      });
      console.log(`👤 Usuario admin creado → ${adminEmail} / admin123`);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 API escuchando en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ Error al iniciar la API:', err);
  }
})();