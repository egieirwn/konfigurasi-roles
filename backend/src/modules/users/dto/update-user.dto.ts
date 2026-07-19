import {
  IsEmail,
  IsString,
  MinLength,
  IsUUID,
  IsOptional,
  IsBoolean,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  password?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Valid role ID is required' })
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
