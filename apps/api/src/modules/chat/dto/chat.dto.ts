import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChat {
  @IsString()
  @IsNotEmpty()
  title!: string;
}
