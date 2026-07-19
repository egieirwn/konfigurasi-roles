import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('profile')
@UseGuards(PermissionsGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  @Permissions('profile:read')
  getProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Patch()
  @Permissions('profile:update')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const profile = await this.profileService.updateProfile(userId, updateProfileDto);
    await this.activityLogsService.create({
      userId,
      action: 'UPDATE',
      module: 'profile',
      description: 'Updated profile information',
    });
    return profile;
  }

  @Patch('password')
  @Permissions('profile:update')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const result = await this.profileService.changePassword(userId, changePasswordDto);
    await this.activityLogsService.create({
      userId,
      action: 'UPDATE',
      module: 'profile',
      description: 'Changed password',
    });
    return result;
  }
}
