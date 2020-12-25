import { RolesEnum } from '../../users/enums/roles.enum';
import { SubscriptionDbDto } from '../../subscription/dto/subscription-db.dto';

export interface UserTokenDataDto {
  _id: string;
  roles: [RolesEnum];
  subscription?: SubscriptionDbDto;
}
