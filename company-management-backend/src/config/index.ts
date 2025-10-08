import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
  redisUrl: process.env.REDIS_URL as string,
};

export default config;
