import { ApiProperty } from '@nestjs/swagger';
export class buyItemDto {
    @ApiProperty({ example: 1, description: 'ID of the item to buy' })
    itemId!: number;
  }