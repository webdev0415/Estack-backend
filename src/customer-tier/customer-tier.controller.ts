import { Controller, Get, Logger, Param, Put, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerTierService } from './customer-tier.service';
import { CustomerTierPublicDto } from './dto/customer-tier-public.dto';
import { CustomerTiersPublicDto } from './dto/customer-tiers-public.dto';
import { BusinessDataDto } from '../business/dto/business-data.dto';
import { UserBusinessesDto } from './dto/user-businesses.dto';
import { MongoIdDto } from '../../util/dto/mongo-id.dto';

/**
 * customer tier controller
 */
@ApiTags('customer-tier')
@Controller('customer-tier')
export class CustomerTierController {
  /** logger */
  private readonly logger = new Logger(CustomerTierController.name);

  /**
   * @param {CustomerTierService} customerTierService - inject
   */
  constructor(private readonly customerTierService: CustomerTierService) {
  }

  /**
   * /join endpoint handler
   * @returns {Promise<CustomerTierPublicDto>}
   * @param businessId
   * @param user - user data from token
   */
  @Put('/service/join/:id')
  @ApiOperation({ operationId: 'createMerchant' })
  @ApiResponse({ status: 201, description: 'OK', type: CustomerTierPublicDto })
  async createUser(@Param() { id: businessId }: MongoIdDto, @Request() { user }): Promise<CustomerTierPublicDto> {
    this.logger.log(`join ${businessId}`);
    return this.customerTierService.join(businessId, user._id);
  }

  /**
   * /available-business - returns all business available for customer
   * @returns {Promise<BusinessDataDto[]>}
   * @param businessId
   * @param user
   */
  @Get('/service/available-business')
  @ApiOperation({ operationId: 'getAvailableBusinesses' })
  @ApiResponse({ status: 201, description: 'OK', type: [BusinessDataDto] })
  async getAvailableBusinesses(@Request() { user }): Promise<BusinessDataDto[]> {
    this.logger.log(`available-business ${user._id}`);
    return this.customerTierService.getAvailableBusinesses(user._id);
  }

  /**
   * /user-business endpoint handler
   * @returns Promise<UserBusinessesDto[]>} - all available businesses for user
   * @param businessId
   * @param user
   */
  @Get('/service/user-business')
  @ApiOperation({ operationId: 'getUserBusinesses' })
  @ApiResponse({ status: 201, description: 'OK', type: [UserBusinessesDto] })
  async getUserBusinesses(@Request() { user }): Promise<UserBusinessesDto[]> {
    this.logger.log(`user-business ${user._id}`);
    return this.customerTierService.getUserBusinesses(user._id);
  }

  /**
   * /business/:id endpoint handler
   * @returns {Promise<CustomerTierPublicDto>}
   * @param businessId
   * @param user
   */
  @Get('/service/business/:id')
  @ApiOperation({ operationId: 'getBusinessForUser' })
  @ApiResponse({ status: 201, description: 'OK', type: CustomerTiersPublicDto })
  async getBusinessForUser(@Request() { user }, @Param() { id: businessId }: MongoIdDto): Promise<CustomerTierPublicDto> {
    this.logger.log(`business ${user._id}`);
    return this.customerTierService.getBusinessForUser(user._id, businessId);
  }
}
