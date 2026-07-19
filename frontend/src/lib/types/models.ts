export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { users: number };
  rolePermissions: {
    id: string;
    permission: Permission;
  }[];
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  action: string;
  module: string;
  description: string;
  metadata: any;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}
