import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersSchema } from './users.schema';
import { UsersRepository } from './users.repository';
import { CryptoService } from '../../util/crypto/crypto/crypto.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { FilesModule } from '../filel/files.module';

/** UsersModule - contains user ops  */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UsersSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    FilesModule,
  ],
  providers: [UsersService, UsersRepository, CryptoService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
