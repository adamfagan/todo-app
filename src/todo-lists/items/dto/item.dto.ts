import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { TODO_LIST_ITEM_STATE } from '../../../utils/enums';

export class CreateTodoListItemDto {
  @ApiProperty()
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  deadline: Date;

  @ApiProperty()
  @IsEnum(TODO_LIST_ITEM_STATE)
  @IsOptional()
  state: TODO_LIST_ITEM_STATE;
}

export class UpdateTodoListItemStateDto {
  @ApiProperty()
  @IsEnum(TODO_LIST_ITEM_STATE)
  @IsNotEmpty()
  state: TODO_LIST_ITEM_STATE;
}
