import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaceSchema } from './place.scheme';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Place', schema: PlaceSchema }]),
  ],
  providers: [PlaceService],
  exports: [PlaceService],
})
export class PlaceModule {
}
