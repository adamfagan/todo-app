import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateTodoListDto {
  @ApiProperty()
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ShareTodoListDto {
  @ApiProperty()
  @Min(1)
  @IsInt()
  @IsNotEmpty()
  todoListId: number;

  @ApiProperty()
  @Min(1)
  @IsInt()
  @IsNotEmpty()
  userId: number;
}

export class UpdateTodoListNameDto {
  @ApiProperty()
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  name: string;
}
