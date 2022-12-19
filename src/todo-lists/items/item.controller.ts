import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../auth/decorator';
import { JwtGuard } from '../../auth/guard';
import { CreateTodoListItemDto, UpdateTodoListItemStateDto } from './dto';
import { ItemService } from './item.service';

@ApiBearerAuth()
@ApiTags('todo-lists/:todoListId/items')
@Controller('todo-lists/:todoListId/items')
export class ItemController {
  constructor(private item: ItemService) {}

  // Route for creating a new todo list item
  @UseGuards(JwtGuard)
  @Post()
  createTodoListItem(
    @Param('todoListId', ParseIntPipe) todoListId: number,
    @Body() createTodoListItemDto: CreateTodoListItemDto,
    @GetUser('userId') userId: number,
  ) {
    return this.item.createTodoListItem(
      todoListId,
      userId,
      createTodoListItemDto,
    );
  }

  // Route for updating the specified item of the specified todo list
  @UseGuards(JwtGuard)
  @Patch(':todoListItemId')
  updateTodoListItemState(
    @Param('todoListId', ParseIntPipe) todoListId: number,
    @Param('todoListItemId', ParseIntPipe) todoListItemId: number,
    @Body() updateTodoListItemStateDto: UpdateTodoListItemStateDto,
    @GetUser('userId') userId: number,
  ) {
    return this.item.updateTodoListItemState(
      todoListId,
      todoListItemId,
      userId,
      updateTodoListItemStateDto,
    );
  }

  // Route for viewing the specified item of the specified todo list
  @UseGuards(JwtGuard)
  @Get(':todoListItemId')
  getTodoListItem(
    @Param('todoListId', ParseIntPipe) todoListId: number,
    @Param('todoListItemId', ParseIntPipe) todoListItemId: number,
    @GetUser('userId') userId: number,
  ) {
    return this.item.getTodoListItem(todoListId, todoListItemId, userId);
  }

  // Route for deleting the specified item of the specified todo list
  @UseGuards(JwtGuard)
  @Delete(':todoListItemId')
  deleteTodoListItem(
    @Param('todoListId', ParseIntPipe) todoListId: number,
    @Param('todoListItemId', ParseIntPipe) todoListItemId: number,
    @GetUser('userId') userId: number,
  ) {
    return this.item.deleteTodoListItem(todoListId, todoListItemId, userId);
  }
}
