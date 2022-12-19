import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTodoListItemDto, UpdateTodoListItemStateDto } from './dto';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  // Creates new todo list item
  async createTodoListItem(
    todoListId: number,
    userId: number,
    createTodoListItemDto: CreateTodoListItemDto,
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
        'The todo list to which you are trying add an item does not exist',
      );
    }

    // Check if the user is linked to the todo list
    if (!todoListUsers.map((user) => user.userId).includes(userId)) {
      throw new ForbiddenException(
        'You cannot add an item to this todo list because you are not among the owners of this todo list',
      );
    }

    const todoListItem = await this.prisma.todoListItem.create({
      data: {
        todoListId,
        userId,
        ...createTodoListItemDto,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'New item has been successfully added to the todo list',
      todoListItem,
    };
  }

  // Updates specific todo list item with the state
  async updateTodoListItemState(
    todoListId: number,
    todoListItemId: number,
    userId: number,
    updateTodoListItemStateDto: UpdateTodoListItemStateDto,
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
        'The todo list whose item you are trying to modify does not exist',
      );
    }

    // Check if the user is linked to the todo list
    if (!todoListUsers.map((user) => user.userId).includes(userId)) {
      throw new ForbiddenException(
        'You cannot modify an item of this todo list because you are not among the owners of this todo list',
      );
    }

    // Check if the item to be updated exists
    const todoListItem = await this.prisma.todoListItem.findUnique({
      where: {
        id: todoListItemId,
      },
    });

    if (!todoListItem) {
      throw new NotFoundException(
        'The item you are trying to modify does not exist',
      );
    }

    // Updating item in the database
    const updatedTodoListItem = await this.prisma.todoListItem.update({
      where: {
        id: todoListItemId,
      },
      data: {
        ...updateTodoListItemStateDto,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Item has been successfully modified',
      updatedTodoListItem: { ...updatedTodoListItem },
    };
  }

  // Returns the specified item of the specified todo list
  async getTodoListItem(
    todoListId: number,
    todoListItemId: number,
    userId: number,
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
        'The todo list whose item you are trying to view does not exist',
      );
    }

    // Check if the user is linked to the todo list
    if (!todoListUsers.map((user) => user.userId).includes(userId)) {
      throw new ForbiddenException(
        'You cannot view an item of this todo list because you are not among the owners of this todo list',
      );
    }

    // Check if the item to be viewed exists
    const todoListItem = await this.prisma.todoListItem.findUnique({
      where: {
        id: todoListItemId,
      },
    });

    if (!todoListItem) {
      throw new NotFoundException(
        'The item you are trying to view does not exist',
      );
    }

    return todoListItem;
  }

  // Deletes the specified item of the specified todo list
  async deleteTodoListItem(
    todoListId: number,
    todoListItemId: number,
    userId: number,
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
        'The todo list whose item you are trying to delete does not exist',
      );
    }

    // Check if the user is linked to the todo list
    if (!todoListUsers.map((user) => user.userId).includes(userId)) {
      throw new ForbiddenException(
        'You cannot delete an item of this todo list because you are not among the owners of this todo list',
      );
    }

    // Check if the item to be viewed exists
    const todoListItem = await this.prisma.todoListItem.findUnique({
      where: {
        id: todoListItemId,
      },
    });

    if (!todoListItem) {
      throw new NotFoundException(
        'The item you are trying to delete does not exist',
      );
    }

    const deletedTodoListItem = await this.prisma.todoListItem.delete({
      where: {
        id: todoListItemId,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Item has been successfully deleted',
      deletedTodoListItem: { ...deletedTodoListItem },
    };
  }
}
