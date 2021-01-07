import { Module } from '@nestjs/common';
import { Gateway } from './gateway';
import { AppGateway } from './app.gateway';

@Module({
  providers: [Gateway, AppGateway],
  exports: [Gateway],
})
export class GatewayModule {
}
