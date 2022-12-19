import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { PageOptionsDto } from '../common/dto';

@ApiBearerAuth()
@ApiTags('users')
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private user: UserService) {}
  // Route to get the currently logged in user
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  // Route to get the list of users
  @Get()
  getUsers(@Query() pageOptionsDto: PageOptionsDto) {
    return this.user.getUsers(pageOptionsDto);
  }
}
