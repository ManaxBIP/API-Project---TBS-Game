import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class EquipItemDto {
  @ApiProperty({ example: 42, description: 'ID of the item to equip' })
  @IsInt()
  itemId!: number;
}
