import { ApiProperty } from '@nestjs/swagger';
export class AttackDto {
    @ApiProperty()
    gameId!: number;  
    @ApiProperty()
    playerId!: number; 
    @ApiProperty({ example: 'attack', description: 'Type of action to perform (attack or heal)' })
    action!: string;  
  }