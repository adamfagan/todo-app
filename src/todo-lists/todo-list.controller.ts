import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreateTodoListDto,
  ShareTodoListDto,
  UpdateTodoListNameDto,
} from './dto';
import { TodoListService } from './todo-list.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('todo-lists')
@Controller('/todo-lists')
export class TodoListController {
  constructor(private todoList: TodoListService) {}

  // Route for creating a new todo list
  @UseGuards(JwtGuard)
  @Post()
  createTodoList(
    @Body() createTodoListDto: CreateTodoListDto,
    @GetUser('userId') userId: number,
  ) {
    return this.todoList.createTodoList(userId, createTodoListDto);
  }

  // Route for viewing todo list and its items
  @Get(':todoListId')
  getTodoList(@Param('todoListId', ParseIntPipe) todoListId: number) {
    return this.todoList.getTodoList(todoListId);
  }

  // Route for sharing the specified todo list to another user
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('share')
  shareTodoList(
    @Body() shareTodoListDto: ShareTodoListDto,
    @GetUser('userId') userId: number,
  ) {
    return this.todoList.shareTodoList(shareTodoListDto, userId);
  }

  // Route for updating the specified todo list
  @UseGuards(JwtGuard)
  @Patch(':todoListId')
  updateTodoListName(
    @Param('todoListId', ParseIntPipe) todoListId: number,
    @Body() updateTodoListNameDto: UpdateTodoListNameDto,
    @GetUser('userId') userId: number,
  ) {
    return this.todoList.updateTodoListName(
      todoListId,
      userId,
      updateTodoListNameDto,
    );
  }

  // Route for deleting the specified todo list
  @UseGuards(JwtGuard)
  @Delete(':todoListId')
  deleteTodoList(
    @Param('todoListId', ParseIntPipe) todoListId: number,
    @GetUser('userId') userId: number,
  ) {
    return this.todoList.deleteTodoList(todoListId, userId);
  }
}
