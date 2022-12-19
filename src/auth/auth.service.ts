import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto, RegisterUserDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Register
  async register(registerUserDto: RegisterUserDto) {
    // Check if passwords are the same
    if (registerUserDto.password !== registerUserDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Password hashing
    const hashedPassword = await argon.hash(registerUserDto.password);

    // Creating a new user in the database
    try {
      delete registerUserDto.confirmPassword;
      const user = await this.prisma.user.create({
        data: {
          ...registerUserDto,
          password: hashedPassword,
        },
      });

      delete user.password;

      return {
        statusCode: HttpStatus.CREATED,
        message: 'You have been successfully registered',
        accessToken: await this.signToken(user.id, user.email),
        user,
      };
    } catch (error) {
      // Prisma error for duplicates (email is unique)
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email is already registered');
        }
      }
      throw error;
    }
  }

  // Login
  async login(loginUserDto: LoginUserDto) {
    // Looking into the database if the user with the given email exists
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Checking if the given password matches with the hashed password in the database
    const passwordMatches = await argon.verify(
      user.password,
      loginUserDto.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    delete user.password;

    return {
      statusCode: HttpStatus.OK,
      message: 'You have been successfully logged in',
      accessToken: await this.signToken(user.id, user.email),
      user,
    };
  }

  // Creates access token
  async signToken(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '30m',
      secret: this.config.get('JWT_SECRET'),
    });

    return token;
  }
}
