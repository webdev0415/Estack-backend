import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { UsersRepository } from './users.repository';
import { PublicUserDto } from './dto/public-user.dto';
import { DbUserDto } from './dto/db-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateFileDto } from '../filel/dto/create-file.dto';
import { FilesRepository } from '../filel/files.repository';

/** lodash */
const _ = require('lodash');

/** user service */
@Injectable()
export class UsersService {
  /**
   * UsersService
   * @param {UsersRepository} userModel - inject
   * @param fileRepository
   */
  constructor(
    private readonly userModel: UsersRepository,
    private readonly fileRepository: FilesRepository,
  ) {
  }

  /**
   * create func
   * @param {CreateUserDto} user - user data
   * @returns {Promise<PublicUserDto>} - created user
   */
  async create(user: CreateUserDto): Promise<DbUserDto> {
    const filter: any[] = [
      { 'auth.email': user.email },
    ];

    if (user.googleId) {
      filter.push({ 'auth.googleId': user.googleId });
    }

    if (user.fbId) {
      filter.push({ 'auth.fbId': user.fbId });
    }

    const localUser = await this.userModel.exist({ $or: filter });

    if (localUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    return await this.userModel.create(user);
  }

  /**
   * getByEmail func
   * @param {string} email - user email
   * @returns {Promise<DbUserDto>} - user
   */
  async getByEmail(email: string): Promise<DbUserDto> {
    return this.userModel.getByEmail(email);
  }

  /**
   * getById func
   * @param {string} id - user id
   * @returns {Promise<PublicUserDto>} - user
   */
  async getById(id: string): Promise<DbUserDto> {
    const user = await this.userModel.getById(id);
    if (user) {
      return user;
    }

    throw new HttpException('user not found', HttpStatus.NOT_FOUND);
  }

  /**
   * getById func
   * @param {string} id - user id
   * @returns {Promise<PublicUserDto>} - user
   */
  async deleteById(id: string): Promise<PublicUserDto> {
    const user = await this.userModel.deleteById(id);
    if (user) {
      return this.returnPublicUser(user);
    }

    throw new HttpException('user not found', HttpStatus.NOT_FOUND);
  }

  /**
   * returnPublicUser
   * @param {DbUserDto} data - user with sensitive data
   * @returns {PublicUserDto} - user without sensitive data
   */
  returnPublicUser(data: DbUserDto | PublicUserDto): PublicUserDto {
    return _.pick(data, [
      'roles',
      '_id',
      'auth',
      'fullName',
      'createdAt',
      'avatarFileId',
    ]);
  }

  /**
   * exist func
   * @param filter - filter to search
   * @returns {Promise<boolean>}
   */
  exist(filter): Promise<boolean> {
    return this.userModel.exist(filter);
  }

  async update(id: string, user: Partial<DbUserDto>): Promise<DbUserDto> {
    if (mongoose.Types.ObjectId(id)) {
      return await this.userModel.update(id, user);
    }
  }

  async uploadAvatarImage(userId: PublicUserDto['_id'], data: CreateFileDto): Promise<PublicUserDto> {
    const file = await this.fileRepository.create(data);
    const user = this.returnPublicUser(await this.update(userId, { avatarFileId: file._id }));
    return {
      ...user,
      image: file,
    };
  }
}
