import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';
import {
  RepositoryError,
  ResourceConflictError,
  ResourceNotFoundError,
} from '../../common/errors/application-errors';
import { fromRepository } from '../../common/effect/from-repository';
import { CreateItemDto } from './dto/create-item.dto';
import { ListItemsQueryDto } from './dto/list-items-query.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './domain/item';
import { ItemRepository } from './repositories/item.repository';

type ItemServiceError =
  | RepositoryError
  | ResourceConflictError
  | ResourceNotFoundError;

export interface PaginatedItems {
  readonly data: Item[];
  readonly meta: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

@Injectable()
export class ItemsService {
  constructor(private readonly repository: ItemRepository) {}

  create(input: CreateItemDto): Effect.Effect<Item, ItemServiceError> {
    const repository = this.repository;

    return Effect.gen(function* () {
      const existing = yield* fromRepository('items.findByName', () =>
        repository.findByName(input.name),
      );

      if (existing) {
        return yield* Effect.fail(
          new ResourceConflictError({
            resource: 'Item',
            reason: 'An item with this name already exists',
          }),
        );
      }

      return yield* fromRepository('items.create', () => repository.create(input));
    });
  }

  findAll(
    query: ListItemsQueryDto,
  ): Effect.Effect<PaginatedItems, RepositoryError> {
    const repository = this.repository;
    const offset = (query.page - 1) * query.limit;

    return Effect.gen(function* () {
      const data = yield* fromRepository('items.findAll', () =>
        repository.findAll({ offset, limit: query.limit }),
      );
      const total = yield* fromRepository('items.count', () => repository.count());

      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      };
    });
  }

  findOne(id: string): Effect.Effect<Item, ItemServiceError> {
    const repository = this.repository;

    return Effect.gen(function* () {
      const item = yield* fromRepository('items.findById', () =>
        repository.findById(id),
      );

      if (!item) {
        return yield* Effect.fail(
          new ResourceNotFoundError({ resource: 'Item', id }),
        );
      }

      return item;
    });
  }

  update(
    id: string,
    input: UpdateItemDto,
  ): Effect.Effect<Item, ItemServiceError> {
    const repository = this.repository;

    return Effect.gen(function* () {
      const current = yield* fromRepository('items.findById', () =>
        repository.findById(id),
      );

      if (!current) {
        return yield* Effect.fail(
          new ResourceNotFoundError({ resource: 'Item', id }),
        );
      }

      if (input.name && input.name !== current.name) {
        const duplicate = yield* fromRepository('items.findByName', () =>
          repository.findByName(input.name as string),
        );

        if (duplicate && duplicate.id !== id) {
          return yield* Effect.fail(
            new ResourceConflictError({
              resource: 'Item',
              reason: 'An item with this name already exists',
            }),
          );
        }
      }

      const updated = yield* fromRepository('items.update', () =>
        repository.update(id, input),
      );

      if (!updated) {
        return yield* Effect.fail(
          new ResourceNotFoundError({ resource: 'Item', id }),
        );
      }

      return updated;
    });
  }

  remove(id: string): Effect.Effect<void, ItemServiceError> {
    const repository = this.repository;

    return Effect.gen(function* () {
      const removed = yield* fromRepository('items.remove', () =>
        repository.remove(id),
      );

      if (!removed) {
        return yield* Effect.fail(
          new ResourceNotFoundError({ resource: 'Item', id }),
        );
      }
    });
  }
}
