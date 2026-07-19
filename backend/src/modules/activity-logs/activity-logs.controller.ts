import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { PaginationDto } from '../../common/dto';
import { Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@Controller('activity-logs')
@UseGuards(PermissionsGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Permissions('activity-logs:read')
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.activityLogsService.findAll(paginationDto, { module, action, userId });
  }

  @Get('recent')
  @Permissions('activity-logs:read')
  getRecent(@Query('limit') limit?: number) {
    return this.activityLogsService.getRecentActivity(limit || 10);
  }
}
