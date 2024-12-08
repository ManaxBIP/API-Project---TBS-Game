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

  async GetPlayerStats(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: Number(playerId) },
    });
    return {
      name: player?.name,
      race: player?.race,
      gold: player?.gold, 
      strength: player?.strength,
      resistance: player?.resistance,
      vitality: player?.vitality
    }
  }

  async equipItem(playerId: number, itemId: number) {
    let playerItem = await this.prisma.playerItems.findFirst({
      where: {
        playerId: playerId,
        itemId: itemId,
      },
    });

    if (!playerItem) return { message: 'Item not found' };

    if (playerItem.Equipped) return { message: 'Item already equipped' };

    playerItem = await this.prisma.playerItems.update({
      where: { 
        playerId_itemId: {
          playerId: playerId,
          itemId: itemId,
        }
      },
      data: { Equipped: true },
    });

    const item = await this.prisma.items.findUnique({
      where: { id: itemId },
    });
    
    if (!item) return { message: 'Item not found' };

    await this.prisma.player.update({
      where: { id: playerId },
      data: {
        strength: { increment: item.strength },
        resistance: { increment: item.resistance },
        vitality: { increment: item.vitality },
      },
    });

    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    return { message: 'Item equipped', 'new strength': player?.strength, 'new resistance': player?.resistance, 'new vitality': player?.vitality };
  }

  async unequipItem(playerId: number, itemId: number) {
    let playerItem = await this.prisma.playerItems.findFirst({
      where: {
        playerId: playerId,
        itemId: itemId,
      },
    });

    if (!playerItem) return { message: 'Item not found' };

    if (!playerItem.Equipped) return { message: 'Item not equipped' };

    playerItem = await this.prisma.playerItems.update({
      where: { 
        playerId_itemId: {
          playerId: playerId,
          itemId: itemId,
        }
      },
      data: { Equipped: false },
    });

    const item = await this.prisma.items.findUnique({
      where: { id: itemId },
    });
    
    if (!item) return { message: 'Item not found' };

    await this.prisma.player.update({
      where: { id: playerId },
      data: {
        strength: { decrement: item.strength },
        resistance: { decrement: item.resistance },
        vitality: { decrement: item.vitality },
      },
    });

    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    return { message: 'Item unequipped', 'new strength': player?.strength, 'new resistance': player?.resistance, 'new vitality': player?.vitality };
  }

  async getInventory(playerId: number) {
    return this.prisma.playerItems.findMany({
      where: { playerId },
      select: {
      Equipped: true,
      item: {
        select: {
          id: true,
          name: true,
          type: true,
          price: true,
          strength: true,
          resistance: true,
          vitality: true,
        },
      },
      },
    });
  }

  async delete(playerId: number) {
    await this.prisma.player.delete({
      where: { id: playerId },
    });
    return { message: 'This player has been deleted' };
  }
}
