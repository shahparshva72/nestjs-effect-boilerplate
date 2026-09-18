import { Effect } from 'effect';
import { RepositoryError } from '../errors/application-errors';

export function fromRepository<A>(
  operation: string,
  run: () => Promise<A>,
): Effect.Effect<A, RepositoryError> {
  return Effect.tryPromise({
    try: run,
    catch: (cause) => new RepositoryError({ operation, cause }),
  });
}
