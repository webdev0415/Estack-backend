import { Body, Controller, Get, Logger, Patch, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { PublicUserDto } from '../users/dto/public-user.dto';
import { JwtPayload } from './dto/jwt-payload.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { DbUserDto } from '../users/dto/db-user.dto';
import { TokenDto } from './dto/token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GetVerifyEmailDto } from './dto/get-verify-email.dto';

/**
 * auth controller
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /** logger */
  private readonly logger = new Logger(AuthController.name);

  /**
   * @param {AuthService} authService - auth service
   */
  constructor(private readonly authService: AuthService) {
  }

  /**
   * /login endpoint handler
   * @param user
   * @param {LoginDto} creds - user credentials
   * @returns {LoginResponseDto} - authencticated user
   */
  @Post('login/customer')
  @ApiOperation({ operationId: 'loginCustomer' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  async loginCustomer(@Request() { user }: { user: DbUserDto }, @Body() creds: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`login ${user._id}`);
    return this.authService.login(user);
  }

  /**
   * /login endpoint handler
   * @param {LoginDto} creds - user credentials
   * @returns {LoginResponseDto} - authencticated user
   */
  @Post('login/merchant')
  @ApiOperation({ operationId: 'loginMerchant' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  async loginMerchant(@Request() { user }, @Body() creds: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`login ${user._id}`);
    return this.authService.loginMerchant(user);
  }

  /**
   * /login endpoint handler
   * @param {LoginDto} creds - user credentials
   * @returns {LoginResponseDto} - authencticated user
   */
  @Post('login/pos')
  @ApiOperation({ operationId: 'loginPOS' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  async loginPOS(@Request() { user }, @Body() creds: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`login ${user._id}`);
    return this.authService.login(user);
  }

  /**
   * /self endpoint handler
   * @param {JwtPayload} user
   * @returns {Promise<PublicUserDto>} - user
   */
  @Get('/self')
  @ApiOperation({ operationId: 'getSelf' })
  @ApiResponse({ status: 200, description: 'OK', type: PublicUserDto })
  getSelf(@Request() { user }: { user: JwtPayload }): Promise<PublicUserDto> {
    return this.authService.self(user._id);
  }

  /**
   * /refresh endpoint handler
   * @returns {Promise<LoginResponseDto>} - user
   */
  @Post('/refresh/merchant')
  @ApiOperation({ operationId: 'refreshMerchant' })
  @ApiResponse({ status: 200, description: 'OK', type: RefreshResponseDto })
  refreshMerchant(@Request() { user }, @Body() { token }: TokenDto): Promise<RefreshResponseDto> {
    return this.authService.refreshMerchant(user);
  }

  /**
   * /refresh endpoint handler
   * @returns {Promise<LoginResponseDto>} - user
   */
  @Post('/refresh/customer')
  @ApiOperation({ operationId: 'refreshCustomer' })
  @ApiResponse({ status: 200, description: 'OK', type: RefreshResponseDto })
  refreshCustomer(@Request() { user }, @Body() { token }: TokenDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(user);
  }

  /**
   * /refresh endpoint handler
   * @returns {Promise<LoginResponseDto>} - user
   */
  @Post('/refresh/pos')
  @ApiOperation({ operationId: 'refreshPos' })
  @ApiResponse({ status: 200, description: 'OK', type: RefreshResponseDto })
  refreshPos(@Request() { user }, @Body() { token }: TokenDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(user);
  }

  /**
   * /refresh endpoint handler
   * @returns {Promise<LoginResponseDto>} - user
   */
  @Patch('/reset-password/pos')
  @ApiOperation({ operationId: 'resetPosPassword' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  resetPosPassword(@Request() { user }, @Body() { oldPassword, password }: ResetPasswordDto): Promise<LoginResponseDto> {
    return this.authService.resetPassword(user._id, oldPassword, password);
  }

  /**
   * /refresh endpoint handler
   * @returns {Promise<LoginResponseDto>} - user
   */
  @Patch('/reset-password/customer')
  @ApiOperation({ operationId: 'resetCustomerPassword' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  resetCustomerPassword(@Request() { user }, @Body() { oldPassword, password }: ResetPasswordDto): Promise<LoginResponseDto> {
    return this.authService.resetPassword(user._id, oldPassword, password);
  }

  /**
   * /refresh endpoint handler
   * @returns {Promise<LoginResponseDto>} - user
   */
  @Patch('/reset-password/merchant')
  @ApiOperation({ operationId: 'resetMerchantPassword' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  resetMerchantPassword(@Request() { user }, @Body() { oldPassword, password }: ResetPasswordDto): Promise<LoginResponseDto> {
    return this.authService.resetMerchantPassword(user._id, oldPassword, password);
  }

  @Post('/forgot-password')
  @ApiOperation({ operationId: 'forgotPassword' })
  @ApiResponse({ status: 200, description: 'OK' })
  forgotPassword(@Body() { email }: { email: string }): Promise<boolean | void> {
    return this.authService.forgotPassword(email);
  }

  @Post('google/login/merchant')
  @ApiOperation({ operationId: 'loginGoogleMerchant' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  async loginGoogleMerchant(@Request() { user }, @Body() creds: TokenDto): Promise<LoginResponseDto> {
    this.logger.log(`login ${user._id}`);
    return this.authService.loginMerchant(user);
  }

  @Post('google/login/customer')
  @ApiOperation({ operationId: 'loginGoogleCustomer' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  async loginGoogleCustomer(@Request() { user }, @Body() creds: TokenDto): Promise<LoginResponseDto> {
    this.logger.log(`login ${user._id}`);
    return this.authService.login(user);
  }

  @Post('fb/login/customer')
  @ApiOperation({ operationId: 'loginFBCustomer' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  async loginFBCustomer(@Request() { user }, @Body() creds: TokenDto): Promise<LoginResponseDto> {
    this.logger.log(`login ${user._id}`);
    return this.authService.login(user);
  }

  @Post('/customer/get-password')
  @ApiOperation({ operationId: 'getCustomerPassword' })
  @ApiResponse({ status: 200, description: 'OK' })
  getCustomerPassword(@Body() { email }: { email: string }): Promise<boolean> {
    return this.authService.getCustomerPassword(email);
  }

  @Post('verify-email')
  @ApiOperation({ operationId: 'verifyEmail' })
  @ApiResponse({ status: 200, description: 'OK', type: String })
  verifyEmail(@Body() body: VerifyEmailDto): Promise<string> {
    return this.authService.validateEmail(body);
  }

  @Post('get-verify-email')
  @ApiOperation({ operationId: 'getVerifyEmail' })
  @ApiResponse({ status: 200, description: 'OK' })
  getVerifyEmail(@Body() body: GetVerifyEmailDto): Promise<void> {
    return this.authService.getValidationEmailCode(body);
  }

}
