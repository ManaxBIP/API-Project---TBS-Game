import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.create(createPlayerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':name')
  async findPlayer(@Param('name') name: string) {
    return this.playerService.GetPlayerInfos(name);
  }
}
