import type { Elysia } from 'elysia';
import { AppError } from './app-error';
import type { ApiResponse } from '../types/api.types';
import { env } from '@config/env';

export const errorHandler = (app: Elysia) => {
  return app.onError(({ code, error, set }) => {
    const timestamp = new Date().toISOString();

    if (error instanceof AppError) {
      set.status = error.statusCode;

      const response: ApiResponse = {
        success: false,
        error: error.code,
        message: error.message,
        timestamp,
      };

      return response;
    }

    if (code === 'VALIDATION') {
      set.status = 400;

      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: String(error),
        timestamp,
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;

      return {
        success: false,
        error: 'NOT_FOUND',
        message: 'Resource not found',
        timestamp,
      };
    }

    console.error('Unhandled error:', error);

    set.status = 500;

    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'An unexpected error occurred';

    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message:
        env.nodeEnv === 'production' ? 'An unexpected error occurred' : errorMessage,
      timestamp,
    };
  });
};
