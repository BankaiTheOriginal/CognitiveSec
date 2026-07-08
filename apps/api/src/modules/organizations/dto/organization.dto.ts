import { IsOptional, IsString } from 'class-validator';

export class UpdateOrganization {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;
}
