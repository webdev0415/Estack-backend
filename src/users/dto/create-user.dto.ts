/** input for create user endpoint */
import { RolesEnum } from '../enums/roles.enum';

export interface CreateUserDto {
  /** email */
  email: string;

  /** googleId */
  googleId?: string;

  /** fbId */
  fbId?: string;

  /** password */
  password?: string;

  /** Full Name */
  fullName?: string;

  /** roles */
 roles: [RolesEnum];
}
