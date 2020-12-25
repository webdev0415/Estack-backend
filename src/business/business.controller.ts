import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { MongoIdDto } from '../../util/dto/mongo-id.dto';
import { PublicBusinessDto } from './dto/public-business.dto';

/**
 * business controller
 */
@ApiTags('business')
@Controller('business')
export class BusinessController {

  /**
   * @param {BusinessService} businessService - inject
   */
  constructor(private readonly businessService: BusinessService) {
  }

  /**
   * /update endpoint handler
   * @param id
   * @returns {Promise<PublicCustomerDto>} - updated customer
   */
  @Get('service/data/:id')
  @ApiOperation({ operationId: 'getBusinessData' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicBusinessDto })
  async getBusinessData(@Param() { id }: MongoIdDto): Promise<PublicBusinessDto> {
    return this.businessService.getBusinessData(id);
  }
}
