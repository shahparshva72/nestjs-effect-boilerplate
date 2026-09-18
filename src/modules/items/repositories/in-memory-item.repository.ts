import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CreateItemInput,
  Item,
  ListItemsInput,
  UpdateItemInput,
} from '../domain/item';
import { ItemRepository } from './item.repository';

@Injectable()
export class InMemoryItemRepository extends ItemRepository {
  private readonly items = new Map<string, Item>();

  async create(input: CreateItemInput): Promise<Item> {
    const now = new Date();
    const item: Item = {
      id: randomUUID(),
      name: input.name,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.set(item.id, item);
    return item;
  }

  async findAll(input: ListItemsInput): Promise<Item[]> {
    return [...this.items.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(input.offset, input.offset + input.limit);
  }

  async count(): Promise<number> {
    return this.items.size;
  }

  async findById(id: string): Promise<Item | null> {
    return this.items.get(id) ?? null;
  }

  async findByName(name: string): Promise<Item | null> {
    const normalizedName = name.trim().toLowerCase();

    return (
      [...this.items.values()].find(
        (item) => item.name.trim().toLowerCase() === normalizedName,
      ) ?? null
    );
  }

  async update(id: string, input: UpdateItemInput): Promise<Item | null> {
    const current = this.items.get(id);

    if (!current) {
      return null;
    }

    const updated: Item = {
      ...current,
      ...input,
      updatedAt: new Date(),
    };

    this.items.set(id, updated);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
}
