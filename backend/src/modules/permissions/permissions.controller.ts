import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@Controller('permissions')
@UseGuards(PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permissions('permissions:read')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('module/:module')
  @Permissions('permissions:read')
  findByModule(@Param('module') module: string) {
    return this.permissionsService.findByModule(module);
  }
}
