import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventNamesEnum } from './enum/event-names.enum';

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  // @SubscribeMessage('msgToServer')
  // handleMessage(client: Socket, payload: string): void {
  //   this.server.emit('msgToClient', payload);
  // }

  emitEvent(eventName: EventNamesEnum, payload): void {
    this.server.emit(eventName, payload);
  }

  afterInit(server: Server) {
    this.logger.log('WEBSOCKETS WAS INITED');

  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
