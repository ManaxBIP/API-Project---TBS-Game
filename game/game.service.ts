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

  async action(attackDto: AttackDto) {
    const player = await this.prisma.player.findUnique({
      where: { id: attackDto.playerId },
    });

    if (!player) return { error: 'Player not found' };

    const game = await this.prisma.game.findUnique({ where: { id: attackDto.gameId } });
  
    if (!game) return { error: 'Game not found' };
    if (game.status !== 'ongoing') throw new Error('Game is already finished');
  
    switch (attackDto.action) {
      case 'attack':
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
          const GoldLoot = Math.floor(Math.random() * 50);
          log.push(`Player looted ${GoldLoot} gold`);
          await this.prisma.player.update({
            where: { id: player.id },
            data: {
              gold: player.gold + GoldLoot,
            },
          });
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

      case 'heal':
        let playerHeal = 0;

        const potions = await this.prisma.playerItems.findMany({
          where: {
            playerId: player.id,
            OR: [
              { item: { name: 'Potion' } },
              { item: { name: 'Little potion' } },
            ],
          },
          include: { item: true },
        });

        if (potions.length > 0) {
          const potion = potions.find(p => p.item.name === 'Potion') || potions.find(p => p.item.name === 'Little potion');
          if (potion) {
            await this.prisma.playerItems.delete({
              where: { playerId_itemId: { playerId: player.id, itemId: potion.item.id } },
            });
            playerHeal += potion.item.vitality;
            await this.prisma.player.update({
              where: { id: player.id },
              data: {
                vitality: player.vitality + playerHeal,
              },
            });
          }
        } else {
          return { error: 'No potions available' };
        }
        let opponentDamageHeal = Math.floor(Math.random() * 15);
        opponentDamageHeal -= (player.resistance * opponentDamageHeal) / 100;

      
        const newPlayerHpHeal = game.playerHp - opponentDamageHeal;
      
        let newStatusHeal = 'ongoing';
        const logHeal = [
          `Player healed and restored ${playerHeal} HP`,
          `Opponent retaliated and dealt ${opponentDamageHeal} damage`,
        ];
      
        if (newPlayerHpHeal <= 0 && game.opponentHp <= 0) {
          newStatusHeal = 'draw';
          logHeal.push('Both player and opponent fell at the same time! The game is a draw.');
        } else if (newPlayerHpHeal <= 0) {
          newStatusHeal = 'opponent_won';
          logHeal.push('Opponent wins the game!');
        } else if (game.opponentHp <= 0) {
          newStatusHeal = 'player_won';
          logHeal.push('Player wins the game!');
          const GoldLoot = Math.floor(Math.random() * 50);
          logHeal.push(`Player looted ${GoldLoot} gold`);
          await this.prisma.player.update({
            where: { id: player.id },
            data: {
              gold: player.gold + GoldLoot,
            },
          });
        }
      
        const updatedGameHeal = await this.prisma.game.update({
          where: { id: attackDto.gameId },
          data: {
            playerHp: Math.max(0, newPlayerHpHeal),
            opponentHp: Math.max(0, game.opponentHp),
            turn: game.turn + 1,
            gameLog: { push: logHeal },
            status: newStatusHeal,
          },
        });
      
        // Supprime la partie si elle est terminée
        if (newStatusHeal !== 'ongoing') {
          
          await this.deleteGame(game.id);
      
        }
      
        return updatedGameHeal;
      default:
        return { error: 'Invalid action' };
    }
    
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
  
    await this.prisma.game.delete({ where: { id: gameId } });

    return { message: 'Game deleted' };
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

  async getShop() {
    await this.refreshShop();
    const shop = await this.prisma.shop.findUnique({ where: { id: 1 }, include: { items: {
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        strength: true,
        resistance: true,
        vitality: true,
      }
    } } });
    if (!shop) return { message: 'Shop not found' };

    return shop.items;
  }

    async buyItem(playerId: number,itemId: number) {
      const itemIdInt = Number(itemId);

      const player = await this.prisma.player.findUnique({ where: { id: playerId } });
      if (!player) return { message: 'Player not found' };

      const item = await this.prisma.items.findFirst({
        where: {
          id: itemIdInt,        
          shopId: 1,          
        },
      });
      if (!item) return { message: 'Item not found' };
      const existingRelation = await this.prisma.playerItems.findFirst({
        where: {
          playerId: playerId,
          itemId: itemIdInt,
        },
      });
    
      if (existingRelation) {
        return { message: 'Item already purchased' };
      }
    
      if (player.gold < item.price) return { message: 'Not enough gold' };

      await this.prisma.player.update({
        where: { id: playerId },
        data: {
          gold: player.gold - item.price,
        },
      });

      await this.prisma.playerItems.create({
        data: {
          playerId: player.id,
          itemId: item.id,
        },
      });

      return { message: 'Item purchased successfully' };
    }

    async refreshShop() {
      const shop = await this.prisma.shop.findUnique({ where: { id: 1 }});
      if (!shop) return { message: 'Shop not found' };

      if (shop.updatedAt.getTime() + 24 * 60 * 60 * 1000 > Date.now()) {
        return;
      } else {
        const allItems = await this.prisma.items.findMany();
        let newItems = [];

        while (newItems.length < 3) {
          const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
          newItems.push(randomItem);
        }

        await this.prisma.shop.update({
          where: { id: 1 },
          data: {
            items: {
              set: newItems.map(item => ({ id: item.id })),
            },
            updatedAt: new Date(),
          },
        });

        return;
      }
    }
}
