import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { passwordRegex } from '../../utils/regex';

export class RegisterUserDto {
  @ApiProperty()
  @MaxLength(50)
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty()
  @MaxLength(50)
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @MaxLength(70)
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @MaxLength(255, {
    message: 'Incorrect password format, password is too long',
  })
  @Matches(passwordRegex, {
    message:
      'Incorrect password format, password must contain at least 8 characters, at least 1 lowercase letter, at least 1 uppercase letter and at least 1 number',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @MaxLength(255, {
    message: 'Incorrect password format, password is too long',
  })
  @Matches(passwordRegex, {
    message:
      'Incorrect password format, password must contain at least 8 characters, at least 1 lowercase letter, at least 1 uppercase letter and at least 1 number',
  })
  @IsNotEmpty()
  confirmPassword: string;
}

export class LoginUserDto {
  @ApiProperty()
  @MaxLength(70)
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @MaxLength(255, {
    message: 'Incorrect password format, password is too long',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
