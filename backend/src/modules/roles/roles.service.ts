import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
        rolePermissions: {
          include: { permission: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
      },
      include: {
        _count: { select: { users: true } },
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem && updateRoleDto.name && updateRoleDto.name !== role.name) {
      throw new BadRequestException('Cannot rename system roles');
    }

    if (updateRoleDto.name) {
      const existing = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Role name already exists');
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
      include: {
        _count: { select: { users: true } },
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    if (role._count.users > 0) {
      throw new BadRequestException(
        'Cannot delete role with assigned users. Reassign users first.',
      );
    }

    await this.prisma.role.delete({ where: { id } });
    return { message: 'Role deleted successfully' };
  }

  async assignPermissions(id: string, dto: AssignPermissionsDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Delete existing permissions and recreate
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });

    if (dto.permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      });
    }

    return this.findOne(id);
  }
}
