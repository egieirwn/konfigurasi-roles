import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Define permissions per module
  const permissionDefinitions = [
    { module: 'dashboard', action: 'read', description: 'View dashboard' },
    { module: 'users', action: 'create', description: 'Create users' },
    { module: 'users', action: 'read', description: 'View users' },
    { module: 'users', action: 'update', description: 'Update users' },
    { module: 'users', action: 'delete', description: 'Delete users' },
    { module: 'roles', action: 'create', description: 'Create roles' },
    { module: 'roles', action: 'read', description: 'View roles' },
    { module: 'roles', action: 'update', description: 'Update roles' },
    { module: 'roles', action: 'delete', description: 'Delete roles' },
    { module: 'permissions', action: 'read', description: 'View permissions' },
    { module: 'activity-logs', action: 'read', description: 'View activity logs' },
    { module: 'profile', action: 'read', description: 'View own profile' },
    { module: 'profile', action: 'update', description: 'Update own profile' },
  ];

  // Create permissions
  const permissions: Record<string, string> = {};
  for (const perm of permissionDefinitions) {
    const name = `${perm.module}:${perm.action}`;
    const created = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: {
        name,
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
    });
    permissions[name] = created.id;
  }
  console.log(`✅ Created ${Object.keys(permissions).length} permissions`);

  // Define roles with their permissions
  const roleDefinitions = [
    {
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      isSystem: true,
      permissions: Object.keys(permissions), // all permissions
    },
    {
      name: 'Admin',
      description: 'Administrative access without destructive operations',
      isSystem: true,
      permissions: [
        'dashboard:read',
        'users:create', 'users:read', 'users:update',
        'roles:read',
        'permissions:read',
        'activity-logs:read',
        'profile:read', 'profile:update',
      ],
    },
    {
      name: 'Editor',
      description: 'Content editing access',
      isSystem: true,
      permissions: [
        'dashboard:read',
        'users:read',
        'activity-logs:read',
        'profile:read', 'profile:update',
      ],
    },
    {
      name: 'User',
      description: 'Basic user access',
      isSystem: true,
      permissions: [
        'dashboard:read',
        'profile:read', 'profile:update',
      ],
    },
  ];

  // Create roles and assign permissions
  for (const roleDef of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    });

    // Assign permissions to role
    for (const permName of roleDef.permissions) {
      const permId = permissions[permName];
      if (permId) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permId,
          },
        });
      }
    }
    console.log(`✅ Created role: ${roleDef.name} with ${roleDef.permissions.length} permissions`);
  }

  // Create Super Admin user
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'Super Admin' },
  });

  if (superAdminRole) {
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    await prisma.user.upsert({
      where: { email: 'admin@admin.com' },
      update: {},
      create: {
        email: 'admin@admin.com',
        name: 'Super Admin',
        password: hashedPassword,
        roleId: superAdminRole.id,
        isActive: true,
      },
    });
    console.log('✅ Created Super Admin user (admin@admin.com / Admin123!)');
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
