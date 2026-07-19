import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { Permissions, CurrentUser } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('roles')
@UseGuards(PermissionsGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  @Permissions('roles:read')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('roles:read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Permissions('roles:create')
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    const role = await this.rolesService.create(createRoleDto);
    await this.activityLogsService.create({
      userId,
      action: 'CREATE',
      module: 'roles',
      description: `Created role: ${role.name}`,
    });
    return role;
  }

  @Patch(':id')
  @Permissions('roles:update')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    const role = await this.rolesService.update(id, updateRoleDto);
    await this.activityLogsService.create({
      userId,
      action: 'UPDATE',
      module: 'roles',
      description: `Updated role: ${role.name}`,
    });
    return role;
  }

  @Delete(':id')
  @Permissions('roles:delete')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.rolesService.remove(id);
    await this.activityLogsService.create({
      userId,
      action: 'DELETE',
      module: 'roles',
      description: `Deleted role with id: ${id}`,
    });
    return result;
  }

  @Put(':id/permissions')
  @Permissions('roles:update')
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
    @CurrentUser('id') userId: string,
  ) {
    const role = await this.rolesService.assignPermissions(id, dto);
    await this.activityLogsService.create({
      userId,
      action: 'UPDATE',
      module: 'roles',
      description: `Updated permissions for role: ${role.name}`,
    });
    return role;
  }
}
