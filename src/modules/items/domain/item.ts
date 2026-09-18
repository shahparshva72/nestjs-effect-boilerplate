export interface Item {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateItemInput {
  readonly name: string;
  readonly description?: string;
}

export interface UpdateItemInput {
  readonly name?: string;
  readonly description?: string | null;
}

export interface ListItemsInput {
  readonly offset: number;
  readonly limit: number;
}
