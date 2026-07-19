import { IsArray, IsUUID } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each permission ID must be a valid UUID' })
  permissionIds: string[];
}
