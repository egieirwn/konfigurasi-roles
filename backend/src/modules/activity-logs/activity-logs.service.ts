import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../../common/dto';

interface CreateActivityLogData {
  userId?: string;
  action: string;
  module: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
}

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateActivityLogData) {
    return this.prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        module: data.module,
        description: data.description,
        metadata: data.metadata || null,
        ipAddress: data.ipAddress || null,
      },
    });
  }

  async findAll(paginationDto: PaginationDto, filters?: { module?: string; action?: string; userId?: string }) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { module: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filters?.module) where.module = filters.module;
    if (filters?.action) where.action = filters.action;
    if (filters?.userId) where.userId = filters.userId;

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentActivity(limit: number = 10) {
    return this.prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
