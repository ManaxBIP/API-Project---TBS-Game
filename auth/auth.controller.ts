import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful and JWT token stored in cookie' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { token, player } = await this.authService.login(loginDto);

    // Ajouter le token JWT dans un cookie sécurisé
    res.cookie('jwt', token, {
      httpOnly: true, // Empêche JavaScript de lire le cookie
      secure: false,  // Utilisez `true` en production avec HTTPS
      sameSite: 'strict', // Limite le partage des cookies
      maxAge: 3600000, // Expire après 1 heure
    });

    return res.send({
      message: 'Login successful',
      player,
    });
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful and cookie cleared' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.send({ message: 'Logout successful' });
  }
}
