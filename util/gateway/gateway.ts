import { Injectable } from '@nestjs/common';
import { EventNamesEnum } from './enum/event-names.enum';
import { AppGateway } from './app.gateway';

@Injectable()
export class Gateway {
  constructor(
    private readonly gateway: AppGateway,
  ) {
  }

  emitEvent(eventName: EventNamesEnum, payload): void {
    this.gateway.emitEvent(eventName, payload);
  }
}
