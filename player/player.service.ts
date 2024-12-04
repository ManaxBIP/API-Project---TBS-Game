import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async create(createPlayerDto: CreatePlayerDto) {
    const hashedPassword = await bcrypt.hash(createPlayerDto.password, 10);

    return this.prisma.player.create({
      data: {
        name: createPlayerDto.name,
        race: createPlayerDto.race,
        password: hashedPassword,
        gold: 100, 
        strength: 10,
        resistance: 10,
        vitality: 100,
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.player.findUnique({
      where: { name },
    });
  }

  async GetPlayerInfos(name: string) {
    const player = await this.prisma.player.findUnique({
      where: { name },
    });
    return {
      id: player?.id,
      name: player?.name,
      race: player?.race,
      gold: player?.gold, 
      strength: player?.strength,
      resistance: player?.resistance,
      vitality: player?.vitality
    }
  }
}
