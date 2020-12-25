import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { PublicCustomerDto } from './dto/public-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { MongoIdDto } from '../../util/dto/mongo-id.dto';
import { CustomerTransactionsParamsDto } from '../coupon/dto/customer-transactions-params.dto';
import { TokenDto } from '../auth/dto/token.dto';
import { CreateCustomerSocialDto } from './dto/create-customer-social.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicUserDto } from '../users/dto/public-user.dto';
import { uploadFile } from '../../util/globals';
import config from '../../config';
import { UsersService } from '../users/users.service';

/**
 * customer controller
 */
@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  /** logger */
  private readonly logger = new Logger(CustomerController.name);

  /**
   * @param {CustomerService} customerService - inject
   * @param usersService
   */
  constructor(
    private readonly customerService: CustomerService,
    private readonly usersService: UsersService,
  ) {
  }

  /**
   * /signup endpoint handler
   * @param {CreateCustomerDto} user - user data
   * @returns {Promise<PublicCustomerDto>} - created user
   */
  @Post('/signup')
  @ApiOperation({ operationId: 'createCustomer' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicCustomerDto })
  async create(@Body() user: CreateCustomerDto): Promise<PublicCustomerDto> {
    this.logger.log(`signup ${user.email}`);
    return this.customerService.create(user);
  }

  /**
   * /details endpoint handler
   * @param  {string} id - user id
   * @returns {Promise<PublicCustomerDto>} - found user
   */
  @Get('service/:id')
  @ApiOperation({ operationId: 'details' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicCustomerDto })
  async details(@Param() { id }: MongoIdDto): Promise<PublicCustomerDto> {
    return this.customerService.details(id);
  }

  /**
   * /update endpoint handler
   * @param user - user from toke
   * @param  {string} userId - user id
   * @param {UpdateCustomerDto} customer - customer data
   * @returns {Promise<PublicCustomerDto>} - updated customer
   */
  @Patch('service')
  @ApiOperation({ operationId: 'updateCustomer' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicCustomerDto })
  async update(@Request() { user }, @Body() customer: Partial<UpdateCustomerDto>): Promise<PublicCustomerDto> {
    return this.customerService.update(user._id, customer);
  }

  @Get('service/transactions/logs-list')
  @ApiOperation({ operationId: 'getCustomerTransactionsLogsList' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicCustomerDto })
  async getCustomerTransactionsLogsList(@Query() params: CustomerTransactionsParamsDto, @Request() { user }): Promise<any> { // TODO
    const customer = await this.customerService.getByUserId(user._id);
    if (!customer) {
      throw new UnauthorizedException();
    }
    return this.customerService.getWalletTransactionsLogs(customer._id, params);
  }

  @Get('service/transactions/totals')
  @ApiOperation({ operationId: 'getCustomerTransactionsLogsList' })
  @ApiResponse({ status: 201, description: 'OK' })
  async getTotalWalletData(@Request() { user }): Promise<any> { // TODO
    const customer = await this.customerService.getByUserId(user._id);
    if (!customer) {
      throw new UnauthorizedException();
    }
    return this.customerService.getTotalWalletData(customer._id);
  }

  @Get('service/wallet/data')
  @ApiOperation({ operationId: 'getWalletData' })
  @ApiResponse({ status: 201, description: 'OK' })
  async getWalletData(@Request() { user }): Promise<any> { // TODO
    const customer = await this.customerService.getByUserId(user._id);
    if (!customer) {
      throw new UnauthorizedException();
    }
    return this.customerService.getWalletData(customer._id);
  }

  @Post('singnup/google/:token')
  @ApiOperation({ operationId: 'singWithUpGoogleCustomer' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicCustomerDto })
  async singWithUpGoogle(
    @Param() { token }: TokenDto,
    @Body() user: CreateCustomerSocialDto,
  ): Promise<PublicCustomerDto> {
    return this.customerService.googleSingUp(token, user);
  }

  @Post('singnup/fb/:token')
  @ApiOperation({ operationId: 'singWithUpFbCustomer' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicCustomerDto })
  async singWithUpFb(
    @Param() { token }: TokenDto,
    @Body() user: CreateCustomerSocialDto,
  ): Promise<PublicCustomerDto> {
    return this.customerService.fbSingUp(token, user);
  }

  @Post('service/upload-avatar-image-customer')
  @ApiOperation({ operationId: 'uploadAvatarImageCustomer' })
  @ApiResponse({ status: 201, description: 'OK', type: '' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatarImageCustomer(
    @Request() { user }: { user: PublicUserDto },
    @UploadedFile() file,
  ): Promise<PublicUserDto> {
    if (!file) {
      throw new BadRequestException();
    }

    const fileUrl = `user/${user._id}/avatar/${file.originalname}`;
    await uploadFile(fileUrl, file.buffer);
    return this.usersService.uploadAvatarImage(
      user._id,
      {
        originalName: file.originalname,
        ref: `https://${config.awsConfig.bucket}.s3.amazonaws.com/${fileUrl}`,
        metadata: {
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: file.size,
        },
      });
  }
}
