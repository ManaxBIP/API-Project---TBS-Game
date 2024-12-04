import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { name: string; password: string }) {
    const player = await this.authService.validatePlayer(body.name, body.password);
    if (!player) {
      throw new UnauthorizedException('Invalid name or password');
    }

    return this.authService.login(body.name, body.password);
  }
}
