import {
  CreateItemInput,
  Item,
  ListItemsInput,
  UpdateItemInput,
} from '../domain/item';

export abstract class ItemRepository {
  abstract create(input: CreateItemInput): Promise<Item>;
  abstract findAll(input: ListItemsInput): Promise<Item[]>;
  abstract count(): Promise<number>;
  abstract findById(id: string): Promise<Item | null>;
  abstract findByName(name: string): Promise<Item | null>;
  abstract update(id: string, input: UpdateItemInput): Promise<Item | null>;
  abstract remove(id: string): Promise<boolean>;
}
