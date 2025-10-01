import { RoleType } from 'src/routes/auth/auth.model';
import { UserType } from '../models/shared-user.model';

export type UserWithRoleAndPermissions = UserType & {
  role: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  };
};
