import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlayerService } from '../player/player.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private playerService: PlayerService, private jwtService: JwtService,) {}

  async validatePlayer(LoginDto: LoginDto) {
    const player = await this.playerService.findByName(LoginDto.name);

    if (!player) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(LoginDto.password, player.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return player;
  }

  async login(LoginDto: LoginDto) {
    const player = await this.validatePlayer(LoginDto);

    // Générer le token JWT
    const payload = { sub: player.id, name: player.name };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      token,
      player: {
        id: player.id,
        name: player.name,
        race: player.race,
        gold: player.gold,
        strength: player.strength,
        resistance: player.resistance,
        vitality: player.vitality,
      },
    };
  }

  
}
