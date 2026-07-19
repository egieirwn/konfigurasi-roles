import { IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
