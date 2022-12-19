import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTodoListDto,
  ShareTodoListDto,
  UpdateTodoListNameDto,
} from './dto';

@Injectable()
export class TodoListService {
  constructor(private prisma: PrismaService) {}

  // Creates a new todo list record
  async createTodoList(userId: number, createTodoListDto: CreateTodoListDto) {
    // Creates a new record of the todoList into todo_list table and at the same time
    // creates a new record of the TodoListUser into relation table named todo_list_users
    // Both creations are executed in one transaction
    const todoList = await this.prisma.todoList.create({
      data: {
        name: createTodoListDto.name,
        users: {
          create: {
            userId,
          },
        },
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'New todo list has been successfully created',
      todoList,
    };
  }

  // Returns the specified todo list along with its items
  async getTodoList(todoListId: number) {
    const todoListWithItems = await this.prisma.todoList.findUnique({
      where: {
        id: todoListId,
      },
      include: {
        todoListItems: true,
      },
    });

    if (!todoListWithItems) {
      throw new NotFoundException(
        'The todo list which you are trying to view does not exist',
      );
    }

    return todoListWithItems;
  }

  // Shares the specified todo list to another user
  async shareTodoList(shareTodoListDto: ShareTodoListDto, userId: number) {
    // Search users for todo list with specified todo list id
    const todoListUsers = await this.prisma.todoListUser.findMany({
      where: {
        todoListId: shareTodoListDto.todoListId,
      },
      select: {
        userId: true,
      },
    });

    if (todoListUsers.length === 0) {
      throw new NotFoundException(
        'The todo list which you are trying to share does not exist',
      );
    }

    // Check if the user (who shares) is linked to the todo list
    if (!todoListUsers.map((user) => user.userId).includes(userId)) {
      throw new ForbiddenException(
        'You cannot share this todo list because you are not among the owners of this todo list',
      );
    }

    // The user to whom the todo list is to be shared
    const user = await this.prisma.user.findUnique({
      where: {
        id: shareTodoListDto.userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'The user to whom the todo list should be shared does not exist',
      );
    }

    // Check if the given user (to whom the todo list is shared)
    // is not already among the owners of the given todo list
    const todoListUser = await this.prisma.todoListUser.findUnique({
      where: {
        userId_todoListId: {
          userId: shareTodoListDto.userId,
          todoListId: shareTodoListDto.todoListId,
        },
      },
    });

    if (todoListUser) {
      throw new ConflictException(
        'The given user is already among the owners of the given todo list',
      );
    }

    await this.prisma.todoListUser.create({
      data: { ...shareTodoListDto },
    });

    return {
      statusCode: HttpStatus.OK,
      message: `The todo list with id ${shareTodoListDto.todoListId} was successfully shared to ${user.firstName} ${user.lastName}`,
    };
  }

  // Updates specific todo list
  async updateTodoListName(
    todoListId: number,
    userId: number,
    updateTodoListNameDto: UpdateTodoListNameDto,
  ) {
    // Search users for todo list with specified todo list id
    const todoListUsers = await this.prisma.todoListUser.findMany({
      where: {
        todoListId,
      },
      select: {
        userId: true,
      },
    });

    if (todoListUsers.length === 0) {
      throw new NotFoundException(
        'The todo list which you are trying to update does not exist',
      );
    }

    // Check if the user (who updates) is linked to the todo list
    if (!todoListUsers.map((user) => user.userId).includes(userId)) {
      throw new ForbiddenException(
        'You cannot modify this todo list because you are not among the owners of this todo list',
      );
    }

    // Updating todo list in the database
    const updatedTodoList = await this.prisma.todoList.update({
      where: {
        id: todoListId,
      },
      data: {
        ...updateTodoListNameDto,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Todo list has been successfully modified',
      updatedTodoList: { ...updatedTodoList },
    };
  }

  // Deletes the specified todo list
  async deleteTodoList(todoListId: number, userId: number) {
    // Search users for todo list with specified todo list id
    const todoListUsers = await this.prisma.todoListUser.findMany({
      where: {
        todoListId,
      },
      select: {
        userId: true,
      },
    });

    if (todoListUsers.length === 0) {
      throw new NotFoundException(
        'The todo list which you are trying to delete does not exist',
      );
    }

    // Check if the user (who deletes) is linked to the todo list
    if (!todoListUsers.map((user) => user.userId).includes(userId)) {
      throw new ForbiddenException(
        'You cannot delete this todo list because you are not among the owners of this todo list',
      );
    }

    const deletedTodoList = await this.prisma.todoList.delete({
      where: {
        id: todoListId,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Todo list has been successfully deleted',
      deletedTodoList: { ...deletedTodoList },
    };
  }
}
