import { Module } from '@nestjs/common';
import { EffectModule } from './common/effect/effect.module';
import { HealthController } from './common/health/health.controller';
import { ItemsModule } from './modules/items/items.module';

@Module({
  imports: [EffectModule, ItemsModule],
  controllers: [HealthController],
})
export class AppModule {}
