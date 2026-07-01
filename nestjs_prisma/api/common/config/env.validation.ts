import { plainToInstance } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @IsNumber()
  @IsOptional()
  DATABASE_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsNumber()
  @IsOptional()
  REDIS_DB?: number;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string; // Legacy, kept for backward compat (T-0006 will remove)

  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsString()
  JWT_ACCESS_TOKEN_EXPIRATION: string;

  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsString()
  JWT_REFRESH_TOKEN_EXPIRATION: string;

  @IsString()
  @IsOptional()
  API_PREFIX?: string;

  @IsNumber()
  @IsOptional()
  API_PORT?: number;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsBoolean()
  @IsOptional()
  CORS_CREDENTIALS?: boolean;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_MAX?: number;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_WINDOW_MS?: number;

  @IsString()
  @IsOptional()
  GOONG_API_KEY?: string;

  @IsString()
  @IsOptional()
  GOONG_BASE_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `- ${e.property}: ${Object.values(e.constraints || {}).join(', ')}`).join('\n')}`,
    );
  }

  return validatedConfig;
}
