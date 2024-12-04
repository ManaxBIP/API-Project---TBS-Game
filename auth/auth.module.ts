import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerModule } from '../player/player.module';

@Module({
    imports: [PlayerModule,
        PassportModule,
        JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, PrismaService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
