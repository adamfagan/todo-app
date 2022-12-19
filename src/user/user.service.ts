import { Injectable } from '@nestjs/common';
import { PageOptionsDto } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers(pageOptionsDto: PageOptionsDto) {
    const offset: number =
      pageOptionsDto.page * pageOptionsDto.limit - pageOptionsDto.limit;

    console.log(pageOptionsDto);

    const [users, count] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        skip: offset,
        take: pageOptionsDto.limit,
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      limit: pageOptionsDto.limit,
      page: pageOptionsDto.page,
      totalPages: Math.ceil(count / pageOptionsDto.limit),
      totalCount: count,
    };
  }
}
