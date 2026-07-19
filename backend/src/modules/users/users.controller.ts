import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto';
import { Permissions, CurrentUser } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  @Permissions('users:read')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('stats')
  @Permissions('users:read')
  getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @Permissions('users:read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Permissions('users:create')
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    const user = await this.usersService.create(createUserDto);
    await this.activityLogsService.create({
      userId: currentUserId,
      action: 'CREATE',
      module: 'users',
      description: `Created user: ${user.email}`,
      metadata: { targetUserId: user.id },
    });
    return user;
  }

  @Patch(':id')
  @Permissions('users:update')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    await this.activityLogsService.create({
      userId: currentUserId,
      action: 'UPDATE',
      module: 'users',
      description: `Updated user: ${user.email}`,
      metadata: { targetUserId: user.id },
    });
    return user;
  }

  @Delete(':id')
  @Permissions('users:delete')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    const result = await this.usersService.remove(id);
    await this.activityLogsService.create({
      userId: currentUserId,
      action: 'DELETE',
      module: 'users',
      description: `Deleted user with id: ${id}`,
      metadata: { targetUserId: id },
    });
    return result;
  }
}
