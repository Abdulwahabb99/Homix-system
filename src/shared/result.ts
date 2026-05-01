import type { AppError } from "./errors";

export type Result<TData, TError extends AppError = AppError> =
  | { data: TData; ok: true }
  | { error: TError; ok: false };

export const success = <TData>(data: TData): Result<TData> => ({ data, ok: true });

export const failure = <TError extends AppError>(error: TError): Result<never, TError> => ({
  error,
  ok: false,
});

export const unwrap = <TData, TError extends AppError>(result: Result<TData, TError>): TData => {
  if (!result.ok) {
    throw result.error;
  }

  return result.data;
};
