import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TodoListModule } from './todo-lists/todo-list.module';
import { PrismaModule } from './prisma/prisma.module';
import { ItemModule } from './todo-lists/items/item.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    TodoListModule,
    PrismaModule,
    ItemModule,
  ],
})
export class AppModule {}
