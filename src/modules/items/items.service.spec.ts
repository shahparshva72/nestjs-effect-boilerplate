import { Effect, Either } from 'effect';
import { ResourceConflictError } from '../../common/errors/application-errors';
import { InMemoryItemRepository } from './repositories/in-memory-item.repository';
import { ItemsService } from './items.service';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(() => {
    service = new ItemsService(new InMemoryItemRepository());
  });

  it('creates and reads an item', async () => {
    const created = await Effect.runPromise(
      service.create({ name: 'Example', description: 'Example item' }),
    );

    const found = await Effect.runPromise(service.findOne(created.id));

    expect(found).toEqual(created);
  });

  it('returns a typed conflict for duplicate names', async () => {
    await Effect.runPromise(service.create({ name: 'Example' }));

    const result = await Effect.runPromise(
      Effect.either(service.create({ name: 'Example' })),
    );

    expect(Either.isLeft(result)).toBe(true);

    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ResourceConflictError);
    }
  });

  it('updates and removes an item', async () => {
    const created = await Effect.runPromise(service.create({ name: 'Before' }));

    const updated = await Effect.runPromise(
      service.update(created.id, { name: 'After' }),
    );

    expect(updated.name).toBe('After');

    await Effect.runPromise(service.remove(created.id));

    const result = await Effect.runPromise(
      Effect.either(service.findOne(created.id)),
    );

    expect(Either.isLeft(result)).toBe(true);
  });
});
