import { Controller, Post, Get, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { AttackDto } from './dto/attack.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createGame(@Request() req: any) {
    const userId = req.user.userId; 
    return this.gameService.createGame(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('attack')
  async attack(@Body() attackDto: AttackDto) {
    return this.gameService.attack(attackDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/status')
  async getGameStatus(@Param('id') id: string) {
    const status = await this.gameService.getGameStatus(Number(id));
    if (status.status === 'Game not found') {return status;}

    if (status.status !== 'ongoing') {
      const winner =
        status.status === 'player_won'
          ? 'Player'
          : status.status === 'opponent_won'
          ? 'Opponent'
          : 'None (Draw)';
      return {
        message: `Game Over! Winner: ${winner}`,
        ...status,
      };
    }

    return status;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteGame(@Param('id') id: string) {
    return this.gameService.deleteGame(Number(id));
  }

  // @Post(':id/archive')
  // async archiveGame(@Param('id') id: string) {
  //   return this.gameService.archiveGame(Number(id));
  // }

}
