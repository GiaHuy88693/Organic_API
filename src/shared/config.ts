import { Logger } from '@nestjs/common';
import { config as loadDotenv } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const ENV_PATH = path.resolve('.env');
if (!fs.existsSync(ENV_PATH)) {
  Logger.error(`Configuration file "${ENV_PATH}" not found.`);
  process.exit(1);
}
loadDotenv({ path: ENV_PATH });

// Define allowed environments (for future use if needed)
export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

// Define the environment schema using Zod for validation
const EnvSchema = z.object({
  NODE_ENV: z.enum([
    Environment.Development,
    Environment.Production,
    Environment.Test,
    Environment.Provision,
  ]),
  PORT: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), {
      message: 'PORT must be a number',
    }),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid URL' }),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string().transform(Number),
  OTP_EMAIL: z.string().email(),
  OTP_EMAIL_PASSWORD: z.string(),
  OTP_EMAIL_NAME: z.string(),
  OTP_EXPIRES_IN: z.string().default('5m'),
  SALT_ROUNDS: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), {
      message: 'SALT_ROUNDS must be a number',
    }),
  ADMIN_PASSWORD: z
    .string()
    .min(8, { message: 'ADMIN_PASSWORD must be at least 8 characters long' }),
  ADMIN_EMAIL: z.string().email({
    message: 'ADMIN_EMAIL must be a valid email address',
  }),
  ADMIN_NAME: z.string().min(1, { message: 'ADMIN_NAME must not be empty' }),
  ADMIN_PHONE: z
    .string()
    .min(10, { message: 'ADMIN_PHONE must be at least 10 characters long' }),
  ACCESS_TOKEN_SECRET: z.string().min(10),
  REFRESH_TOKEN_SECRET: z.string().min(10),
  ACCESS_TOKEN_EXPIRATION: z.string(),
  REFRESH_TOKEN_EXPIRATION: z.string(),
  CLOUDINARY_NAME: z
    .string()
    .min(1, { message: 'CLOUDINARY_NAME is required' }),
  CLOUDINARY_API_KEY: z
    .string()
    .min(1, { message: 'CLOUDINARY_API_KEY is required' }),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, { message: 'CLOUDINARY_API_SECRET is required' }),
  CLOUDINARY_DEFAULT_FOLDER: z.string().default('avatars'),
  CLOUDINARY_PDF_FOLDER: z.string().default('pdfs'),
  SECRET_API_KEY: z.string().min(10),
  SWAGGER_USERNAME: z.string().min(1, 'SWAGGER_USERNAME cannot be empty'),
  SWAGGER_PASSWORD: z
    .string()
    .min(8, 'SWAGGER_PASSWORD must be at least 8 characters'),
  // MoMo
  MOMO_PARTNER_CODE: z.string(),
  MOMO_ACCESS_KEY: z.string(),
  MOMO_SECRET_KEY: z.string(),
  MOMO_CREATE_URL: z.string().url(), // <- ép là URL
  APP_BASE_URL: z.string().url(), // <- ép là URL công khai

  // (tuỳ chọn) cho backward-compat: không dùng nữa
  MOMO_REDIRECT_URL: z.string().optional(),
  MOMO_IPN_URL: z.string().optional(),
});

// Parse and validate process.env
const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  Logger.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const envConfig = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  emailHost: parsedEnv.data.EMAIL_HOST,
  emailPort: parsedEnv.data.EMAIL_PORT,
  otpEmail: parsedEnv.data.OTP_EMAIL,
  otpEmailPassword: parsedEnv.data.OTP_EMAIL_PASSWORD,
  otpEmailName: parsedEnv.data.OTP_EMAIL_NAME,
  otpExpiresIn: parsedEnv.data.OTP_EXPIRES_IN,
  satlRounds: parsedEnv.data.SALT_ROUNDS,
  adminPassword: parsedEnv.data.ADMIN_PASSWORD,
  adminEmail: parsedEnv.data.ADMIN_EMAIL,
  adminName: parsedEnv.data.ADMIN_NAME,
  adminPhone: parsedEnv.data.ADMIN_PHONE,
  accessTokenSecret: parsedEnv.data.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: parsedEnv.data.REFRESH_TOKEN_SECRET,
  accessTokenExpiration: parsedEnv.data.ACCESS_TOKEN_EXPIRATION,
  refreshTokenExpiration: parsedEnv.data.REFRESH_TOKEN_EXPIRATION,
  cloudinary: {
    name: parsedEnv.data.CLOUDINARY_NAME,
    apiKey: parsedEnv.data.CLOUDINARY_API_KEY,
    apiSecret: parsedEnv.data.CLOUDINARY_API_SECRET,
    defaultFolder: parsedEnv.data.CLOUDINARY_DEFAULT_FOLDER,
    pdfFolder: parsedEnv.data.CLOUDINARY_PDF_FOLDER,
  },
  secretApiKey: parsedEnv.data.SECRET_API_KEY,
  // MoMo
  momoPartnerCode: parsedEnv.data.MOMO_PARTNER_CODE,
  momoAccessKey: parsedEnv.data.MOMO_ACCESS_KEY,
  momoSecretKey: parsedEnv.data.MOMO_SECRET_KEY,
  momoCreateUrl: parsedEnv.data.MOMO_CREATE_URL,
  appBaseUrl: parsedEnv.data.APP_BASE_URL,

  // Build động từ APP_BASE_URL (không đọc từ .env)
  get momoRedirectUrl() {
    return `http://127.0.0.1:5500/src/pages/cart/thankyou.html`;
  },
  get momoIpnUrl() {
    return `${this.appBaseUrl.replace(/\/+$/, '')}/payments/momo/ipn`;
  },
};

export const ConfigGroups = {
  swagger: {
    username: parsedEnv.data.SWAGGER_USERNAME,
    password: parsedEnv.data.SWAGGER_PASSWORD,
  },
} as const;

export type ConfigGroupsType = typeof ConfigGroups;
