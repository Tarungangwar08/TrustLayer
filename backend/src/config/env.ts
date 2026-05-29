import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'ENCRYPTION_KEY'];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  encryptionKey: process.env.ENCRYPTION_KEY as string,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
