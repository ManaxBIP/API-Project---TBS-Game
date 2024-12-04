import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { AttackDto } from './dto/attack.dto';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async createGame(playerId: number) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) throw new Error('Player not found');

    return this.prisma.game.create({
      data: {
        playerId: playerId,
        playerHp: player.vitality,
        opponentHp: 100,
        turn: 1,
        gameLog: [],
      },
    });
  }

  async attack(attackDto: AttackDto) {
    const player = await this.prisma.player.findUnique({
      where: { id: attackDto.playerId },
    });

    if (!player) return { error: 'Player not found' };

    const game = await this.prisma.game.findUnique({ where: { id: attackDto.gameId } });
  
    if (!game) return { error: 'Game not found' };
    if (game.status !== 'ongoing') throw new Error('Game is already finished');
  
    const playerDamage = Math.floor(Math.random() * 20) + player.strength;
    let opponentDamage = Math.floor(Math.random() * 15);
    opponentDamage -= (player.resistance * opponentDamage) / 100;

  
    const newPlayerHp = game.playerHp - opponentDamage;
    const newOpponentHp = game.opponentHp - playerDamage;
  
    let newStatus = 'ongoing';
    const log = [
      `Player attacked and dealt ${playerDamage} damage`,
      `Opponent retaliated and dealt ${opponentDamage} damage`,
    ];
  
    if (newPlayerHp <= 0 && newOpponentHp <= 0) {
      newStatus = 'draw';
      log.push('Both player and opponent fell at the same time! The game is a draw.');
    } else if (newPlayerHp <= 0) {
      newStatus = 'opponent_won';
      log.push('Opponent wins the game!');
    } else if (newOpponentHp <= 0) {
      newStatus = 'player_won';
      log.push('Player wins the game!');
    }
  
    const updatedGame = await this.prisma.game.update({
      where: { id: attackDto.gameId },
      data: {
        playerHp: Math.max(0, newPlayerHp),
        opponentHp: Math.max(0, newOpponentHp),
        turn: game.turn + 1,
        gameLog: { push: log },
        status: newStatus,
      },
    });
  
    // Supprime la partie si elle est terminée
    if (newStatus !== 'ongoing') {
      
      await this.deleteGame(game.id);
  
    }
  
    return updatedGame;
  }
  
  

  async getGameStatus(gameId: number) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return { status: 'Game not found' };
  
    return {
      playerHp: game.playerHp,
      opponentHp: game.opponentHp,
      turn: game.turn,
      status: game.status,
      gameLog: game.gameLog,
    };
  }
  
  async deleteGame(gameId: number) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
  
    if (!game) return { error: 'Game not found' };
    if (game.status === 'ongoing') return { error: 'Cannot delete an ongoing game' };
  
    return this.prisma.game.delete({ where: { id: gameId } });
  }

  // async archiveGame(gameId: number) {
  //   const game = await this.prisma.game.findUnique({ where: { id: gameId } });
  
  //   if (!game) throw new Error('Game not found');
  //   if (game.status === 'ongoing') throw new Error('Cannot archive an ongoing game');
  
  //   return this.prisma.game.update({
  //     where: { id: gameId },
  //     data: { archived: true },
  //   });
  // }
}
