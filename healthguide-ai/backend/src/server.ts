import app from './app';
import { env } from './config/env';

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`🏥 HealthGuide AI Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
});
