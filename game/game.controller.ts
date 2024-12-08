import { Controller, Post, Get, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GameService } from './game.service';
import { AttackDto } from './dto/attack.dto';
import { buyItemDto } from './dto/buy-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({ summary: 'Create a game' })
  @ApiResponse({ status: 201, description: "Return informations about the new game" })
  @UseGuards(JwtAuthGuard)
  @Post('combat/create')
  async createGame(@Request() req: any) {
    const userId = req.user.userId; 
    return this.gameService.createGame(userId);
  }

  @ApiOperation({ summary: 'Make an action in the game' })
  @ApiResponse({ status: 201, description: "Return informations about the game and the current turn" })
  @UseGuards(JwtAuthGuard)
  @Post('combat/action')
  async attack(@Body() attackDto: AttackDto) {
    return this.gameService.action(attackDto);
  }

  @ApiOperation({ summary: 'Get the status of the game' })
  @ApiResponse({ status: 200, description: "Return informations about the game" })
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

  @ApiOperation({ summary: 'Delete a game' })
  @ApiResponse({ status: 200, description: "Return informations about the deleted game" })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteGame(@Param('id') id: string) {
    return this.gameService.deleteGame(Number(id));
  }

  // @Post(':id/archive')
  // async archiveGame(@Param('id') id: string) {
  //   return this.gameService.archiveGame(Number(id));
  // }


  @ApiOperation({ summary: 'Get items in the shop' })
  @ApiResponse({ status: 200, description: 'List of items in the shop' })
  @UseGuards(JwtAuthGuard)
  @Get('shop')
  async getShop() {
    return this.gameService.getShop();
  }

  @ApiOperation({ summary: 'Buy an item in the shop' })
  @ApiResponse({ status: 200, description: 'Return the item buyed' })
  @UseGuards(JwtAuthGuard)
  @Post('shop/buy')
  async buyItem(@Request() req: any, @Body() buyItemDto: buyItemDto) {
    const playerId = req.user.userId;
    return this.gameService.buyItem(playerId, buyItemDto.itemId);
  }

}
