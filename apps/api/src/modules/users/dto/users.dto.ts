import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from 'generated/prisma/enums';

export class UpdateUser {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
export class UpdateRole {
  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}
