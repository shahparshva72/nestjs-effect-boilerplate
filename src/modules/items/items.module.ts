import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { InMemoryItemRepository } from './repositories/in-memory-item.repository';
import { ItemRepository } from './repositories/item.repository';

@Module({
  controllers: [ItemsController],
  providers: [
    ItemsService,
    InMemoryItemRepository,
    {
      provide: ItemRepository,
      useExisting: InMemoryItemRepository,
    },
  ],
  exports: [ItemsService],
})
export class ItemsModule {}
