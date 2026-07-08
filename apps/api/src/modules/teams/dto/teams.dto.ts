import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTeam {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
export class UpdateTeam extends PartialType(CreateTeam) {}
