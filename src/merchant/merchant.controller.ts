import { BadRequestException, Body, Controller, Get, Logger, Param, Post, Put, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { PublicMerchantDto } from './dto/public-merchant.dto';
import { PublicUserDto } from '../users/dto/public-user.dto';
import { MongoIdDto } from '../../util/dto/mongo-id.dto';
import { CreateLoyaltyTierDto } from '../loyalty-tier/dto/create-loyalty-tier.dto';
import { LoyaltyTierDbDto } from '../loyalty-tier/dto/loyalty-tier-db.dto';
import { LoyaltyTierService } from '../loyalty-tier/loyalty-tier.service';
import { LoyaltyProgramService } from '../loyalty-program/loyalty-program.service';
import { LoyaltyProgramDbDto } from '../loyalty-program/dto/loyalty-program-db.dto';
import { PointCurrencyDbDto } from '../point-currency/dto/point-currency-db.dto';
import { PointCurrencyService } from '../point-currency/point-currency.service';
import { CreateMerchantSocialDto } from './dto/create-merchant-social.dto';
import { uploadFile } from '../../util/globals';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenDto } from '../auth/dto/token.dto';
import { CardInterface, CardList, DeleteCardInterface, TransactionInterface } from '../../util/spripe/stripe';
import config from '../../config';
import { BusinessDto } from '../business/dto/business.dto';
import { UsersService } from '../users/users.service';
import { CreateOtpDto } from './dto/create-otp.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';
import { CreateOtpResponseDto } from './dto/create-otp-response.dto';

/**
 * merchant controller
 */
@ApiTags('merchant')
@Controller('merchant')
export class MerchantController {
  /** logger */
  private readonly logger = new Logger(MerchantController.name);

  /**
   * @param {merchantService} merchantService - inject
   * @param loyaltyTierService
   * @param loyaltyProgramService
   * @param pointCurrencyService
   * @param usersService
   */
  constructor(
    private readonly merchantService: MerchantService,
    private readonly loyaltyTierService: LoyaltyTierService,
    private readonly loyaltyProgramService: LoyaltyProgramService,
    private readonly pointCurrencyService: PointCurrencyService,
    private readonly usersService: UsersService,
  ) {
  }

  /**
   * /signup endpoint handler
   * @param {CreateMerchantDto} user - user data
   * @returns {Promise<PublicMerchantDto>} - created merchant
   */
  @Post('/signup')
  @ApiOperation({ operationId: 'createMerchant' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicMerchantDto })
  async createUser(@Body() user: CreateMerchantDto): Promise<PublicMerchantDto> {
    this.logger.log(`signup ${user.email}`);
    return this.merchantService.create(user);
  }

  /**
   * /signup/optgenerate endpoint handler
   * @param {CreateOtpDto} otpRequest - otp data
   * @returns {Promise<void>}
   */
  @Post('/signup/optgenerate')
  @ApiOperation({ operationId: 'optGenerate' })
  @ApiResponse({ status: 201, description: 'OK', type: CreateOtpResponseDto })
  async optGenerate(@Body() otpRequest: CreateOtpDto): Promise<CreateOtpResponseDto> {
    this.logger.log(`signup otp ${otpRequest.email}`);
    return this.merchantService.otpGenerate(otpRequest);
  }

  /**
   * /signup/optconfirm endpoint handler
   * @param {ValidateOtpDto} otp- otp data
   * @returns {Promise<LoginResponseDto>} - login response
   */
  @Post('/signup/optconfirm')
  @ApiOperation({ operationId: 'optConfirm' })
  @ApiResponse({ status: 201, description: 'OK', type: LoginResponseDto })
  async optConfirm(@Body() otp: ValidateOtpDto): Promise<LoginResponseDto> {
    this.logger.log(`validate otp ${otp.email}`);
    return this.merchantService.otpConfirm(otp);
  }

  @Get('/service/self')
  @ApiOperation({ operationId: 'merchantSelf' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicMerchantDto })
  async merchantSelf(@Request() { user }: { user: PublicUserDto }): Promise<PublicMerchantDto> {
    return this.merchantService.self(user);
  }

  @Get('/service/poses/:onlyActiveStatus')
  @ApiOperation({ operationId: 'getPoses' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicMerchantDto })
  async getPoses(
    @Param('onlyActiveStatus') onlyActiveStatus: string,
    @Request() { user }: { user: PublicUserDto },
  ): Promise<PublicMerchantDto> {
    const merchant = await this.merchantService.getByUserId(user._id);

    return this.merchantService.getPosesFormattedData(merchant._id, onlyActiveStatus === 'true');
  }

  @Put('/service/update-tier/:id')
  @ApiOperation({ operationId: 'updateTier' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicMerchantDto })
  async updateTier(
    @Param() { id }: MongoIdDto,
    @Request() { user }: { user: PublicUserDto },
    @Body() data: Partial<CreateLoyaltyTierDto>,
  ): Promise<LoyaltyTierDbDto> {
    await this.merchantService.getByUserId(user._id);

    return this.loyaltyTierService.update(id, data);
  }

  @Put('/service/update-loyalty-program/:id')
  @ApiOperation({ operationId: 'updateLoyaltyProgram' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicMerchantDto })
  async updateLoyaltyProgram(
    @Param() { id }: MongoIdDto,
    @Request() { user }: { user: PublicUserDto },
    @Body() data: Partial<LoyaltyProgramDbDto>,
  ): Promise<LoyaltyProgramDbDto> {
    await this.merchantService.canLoyaltyProgramStatusBeChanged(user._id);

    return this.loyaltyProgramService.update(id, data);
  }

  @Put('/service/update-point-currency/:id')
  @ApiOperation({ operationId: 'updateLoyaltyProgram' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicMerchantDto })
  async updatePointCurrency(
    @Param() { id }: MongoIdDto,
    @Request() { user }: { user: PublicUserDto },
    @Body() data: Partial<PointCurrencyDbDto>,
  ): Promise<PointCurrencyDbDto> {
    await this.merchantService.getByUserId(user._id);

    return this.pointCurrencyService.update(id, data);
  }

  @Get('service/customers')
  @ApiOperation({ operationId: 'deletePos' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicUserDto })
  async customersStats(
    @Request() { user }: { user: PublicUserDto },
  ): Promise<any> {
    const merchant = await this.merchantService.getByUserId(user._id);
    return this.merchantService.getCustomerStats(merchant);
  }

  @Get('service/transactions')
  @ApiOperation({ operationId: 'deletePos' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicUserDto })
  async transactionsStats(
    @Request() { user }: { user: PublicUserDto },
  ): Promise<any> {
    const merchant = await this.merchantService.getByUserId(user._id);
    return this.merchantService.transactionsStats(merchant);
  }

  @Put('/service/self')
  @ApiOperation({ operationId: 'updateMerchant' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicMerchantDto })
  async updateMerchant(
    @Request() { user }: { user: PublicUserDto },
    @Body() body: Partial<PublicMerchantDto>,
  ): Promise<Partial<PublicMerchantDto>> {
    const merchant = await this.merchantService.getByUserId(user._id);
    return this.merchantService.updateSelf(user, merchant, body);
  }

  @Post('singnup/google/:token')
  @ApiOperation({ operationId: 'singWithUpGoogleMerchant' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicMerchantDto })
  async singWithUpGoogle(
    @Param() { token }: TokenDto,
    @Body() user: CreateMerchantSocialDto,
  ): Promise<any> {
    return this.merchantService.googleSingUp(token, user);
  }

  @Post('service/new-payment')
  @ApiOperation({ operationId: 'addPaymentMethod' })
  @ApiResponse({ status: 201, description: 'OK', type: '' })
  async addPaymentMethod(
    @Request() { user }: { user: PublicUserDto },
    @Body() { token },
  ): Promise<CardInterface> {
    const merchant = await this.merchantService.getByUserId(user._id);
    return this.merchantService.addPaymentMethod(merchant, token);
  }

  @Get('service/payment-list')
  @ApiOperation({ operationId: 'getPaymentList' })
  @ApiResponse({ status: 201, description: 'OK', type: '' })
  async getPaymentList(
    @Request() { user }: { user: PublicUserDto },
  ): Promise<CardList> {
    const merchant = await this.merchantService.getByUserId(user._id);
    return this.merchantService.getPaymentList(merchant);
  }

  @Post('service/submit-payment')
  @ApiOperation({ operationId: 'submitPayment' })
  @ApiResponse({ status: 201, description: 'OK', type: '' })
  async submitPayment(
    @Request() { user }: { user: PublicUserDto },
    @Body() { card },
  ): Promise<TransactionInterface> {
    const merchant = await this.merchantService.getByUserId(user._id);
    return this.merchantService.submitPayment(user, merchant, card);
  }

  @Post('service/delete-payment')
  @ApiOperation({ operationId: 'deletePayment' })
  @ApiResponse({ status: 201, description: 'OK', type: '' })
  async deletePayment(
    @Request() { user }: { user: PublicUserDto },
    @Body() { card },
  ): Promise<DeleteCardInterface> {
    const merchant = await this.merchantService.getByUserId(user._id);
    return this.merchantService.deletePayment(merchant, card);
  }

  @Post('service/upload-brand-avatar')
  @ApiOperation({ operationId: 'uploadBrandAvatar' })
  @ApiResponse({ status: 201, description: 'OK', type: '' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadBrandAvatar(
    @Request() { user }: { user: PublicUserDto },
    @UploadedFile() file,
  ): Promise<BusinessDto> {
    if (!file) {
      throw new BadRequestException();
    }

    const merchant = await this.merchantService.getByUserId(user._id);
    const fileUrl = `merchant/${merchant._id}/brandImage/${new Date().getTime()}`;
    await uploadFile(fileUrl, file.buffer);
    return this.merchantService.uploadBrandNameImage(
      merchant._id,
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

  @Post('service/upload-avatar-image-merchant')
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
