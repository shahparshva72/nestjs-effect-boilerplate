import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EffectRunner } from '../../common/effect/effect-runner.service';
import { CreateItemDto } from './dto/create-item.dto';
import { ListItemsQueryDto } from './dto/list-items-query.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly effectRunner: EffectRunner,
  ) {}

  @Post()
  create(@Body() input: CreateItemDto) {
    return this.effectRunner.run(this.itemsService.create(input));
  }

  @Get()
  findAll(@Query() query: ListItemsQueryDto) {
    return this.effectRunner.run(this.itemsService.findAll(query));
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.effectRunner.run(this.itemsService.findOne(id));
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateItemDto,
  ) {
    return this.effectRunner.run(this.itemsService.update(id, input));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.effectRunner.run(this.itemsService.remove(id));
  }
}
