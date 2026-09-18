import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Effect, Either } from 'effect';
import {
  RepositoryError,
  ResourceConflictError,
  ResourceNotFoundError,
} from '../errors/application-errors';

@Injectable()
export class EffectRunner {
  async run<A, E>(effect: Effect.Effect<A, E, never>): Promise<A> {
    const result = await Effect.runPromise(Effect.either(effect));

    if (Either.isLeft(result)) {
      throw this.toHttpException(result.left);
    }

    return result.right;
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof ResourceNotFoundError) {
      return new NotFoundException(
        error.resource + ' with id "' + error.id + '" was not found',
      );
    }

    if (error instanceof ResourceConflictError) {
      return new ConflictException(error.reason);
    }

    if (error instanceof RepositoryError) {
      return new InternalServerErrorException('A persistence operation failed');
    }

    return new InternalServerErrorException('An unexpected error occurred');
  }
}
