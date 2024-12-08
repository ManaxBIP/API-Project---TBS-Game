import { Controller, Post, Body, Get, Res, UseGuards, Param, Request, Delete } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { EquipItemDto } from './dto/equip-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@ApiBearerAuth()
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @ApiOperation({ summary: 'Create a player' })
  @ApiResponse({ status: 201, description: 'Informations about the new player' })
  @Post('create')
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.create(createPlayerDto);
  }

  @ApiOperation({ summary: 'Delete a player' })
  @ApiResponse({ status: 200, description: 'This player has been deleted' })
  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deletePlayer(@Request() req: any, @Res() res: Response) {
    const playerId = req.user.userId;
    res.clearCookie('jwt');
    return this.playerService.delete(playerId);
  }

  @ApiOperation({ summary: "Get player's stats" })
  @ApiResponse({ status: 200, description: "Return player's statistics" })
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async findPlayer(@Request() req: any) {
    const playerId = req.user.userId;
    return this.playerService.GetPlayerStats(playerId);
  }

  @ApiOperation({ summary: 'Equip an item' })
  @ApiResponse({ status: 200, description: "Return player's stats with the equiped item" })
  @UseGuards(JwtAuthGuard)
  @Post('/equip')
  async equipItem(@Request() req: any, @Body() equipItemDto: EquipItemDto) {
    const playerId = req.user.userId;
    return this.playerService.equipItem(playerId, equipItemDto.itemId);
  }

  @ApiOperation({ summary: 'Unequip an item' })
  @ApiResponse({ status: 200, description: "Return player's stats without the unequipped item" })
  @UseGuards(JwtAuthGuard)
  @Post('/unequip')
  async unequipItem(@Request() req: any, @Body() equipItemDto: EquipItemDto) {
    const playerId = req.user.userId;
    return this.playerService.unequipItem(playerId, equipItemDto.itemId);
  }

  @ApiOperation({ summary: "Show player's inventory" })
  @ApiResponse({ status: 200, description: "Return player's inventory" })
  @UseGuards(JwtAuthGuard)
  @Get('inventory')
  async getInventory(@Request() req: any) {
    const playerId = req.user.userId;
    return this.playerService.getInventory(playerId);
  }
}
