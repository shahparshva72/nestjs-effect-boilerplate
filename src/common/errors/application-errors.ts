import { Data } from 'effect';

export class ResourceNotFoundError extends Data.TaggedError(
  'ResourceNotFoundError',
)<{
  readonly resource: string;
  readonly id: string;
}> {}

export class ResourceConflictError extends Data.TaggedError(
  'ResourceConflictError',
)<{
  readonly resource: string;
  readonly reason: string;
}> {}

export class RepositoryError extends Data.TaggedError('RepositoryError')<{
  readonly operation: string;
  readonly cause: unknown;
}> {}

export type ApplicationError =
  | ResourceNotFoundError
  | ResourceConflictError
  | RepositoryError;
