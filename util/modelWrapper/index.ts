import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { RequestOptions } from './options.interface';
import { HttpException, HttpStatus } from '@nestjs/common';
// tslint:disable-next-line
/** promise */
const q = require('q');

/** page size */
const defaultLimit = 20;
/** page number */
const defaultPageNumber = 0;
/** sort asc */
const defaultAsc = 1;
/** sort desc */
const defaultDesc = -1;
/** page count with empty result */
const defaultPageCount = 0;
/** total count with empty result */
const defaultTotalCount = 0;

/** custom mongoose model wrapper */
export class DbModel {
  /** passed model */
  private readonly model: Model<any>;

  /**
   * DbModel
   * @param {Model<any>} model - mongoose model
   */
  constructor(model: Model<any>) {
    this.model = model;
  }

  /**
   * findRows
   * @param {any} -  query: {}, callback: null
   * @returns {[any]}
   */
  findRows({ query = {}, sortQuery = {}, callback = null } = { query: {}, sortQuery: {}, callback: null }) {
    return this.model
    .find(query)
    .sort(sortQuery)
    .lean()
    .exec(callback);
  }

  /**
   * findRow
   * @param {any} -  query: {}, callback: null
   * @returns {any}
   */
  findRow({ query = {}, sortQuery = {}, callback = null } = { query: {}, sortQuery: {}, callback: null }) {
    return this.model
    .findOne(query)
    .sort(sortQuery)
    .lean()
    .exec(callback);
  }

  /**
   * findById
   * @param {any} -  id, callback = null
   * @returns {any}
   */
  findById({ id, callback = null }) {
    const deferred = q.defer();
    this.model
    .find({
      _id: mongoose.Types.ObjectId(id),
    })
    .lean()
    .exec((err, user) => {
      if (err) {
        // tslint:disable-next-line
        callback && callback(err);
        return deferred.reject(err);
      }
      // tslint:disable-next-line
      callback && callback(null, user[0] ? user[0] : null);
      deferred.resolve(user[0] ? user[0] : null);
    });

    return deferred.promise;
  }

  // Not tested
  /**
   * findById
   * @param {any} -  query, callback = null
   * @returns {[any]}
   */
  aggregateRows(
    { query = [], callback = null } = { query: [], callback: null },
  ) {
    return this.model
    .aggregate(query)
    .allowDiskUse(true)
    .exec(callback);
  }

  // Not tested
  /**
   * populate
   * @param {any} -  items, options, callback = null
   * @returns {[any]}
   */
  populate({ items, options, callback = null }) {
    return this.model.populate(items, options, callback);
  }

  /**
   * rowExists
   * @param {any} -  query, callback = null
   * @returns {boolean}
   */
  rowExists({ query = {}, callback = null } = { query: {}, callback: null }) {
    // tslint:disable-next-line
    let deferred = q.defer();
    this.model.count(query, (err, count) => {
      if (err) {
        // tslint:disable-next-line
        callback && callback(err);
        return deferred.reject(err);
      }
      // tslint:disable-next-line
      callback && callback(null, count > 0);
      deferred.resolve(count > 0);
    });

    return deferred.promise;
  }

  /**
   * countRows
   * @param {any} -  query, callback = null
   * @returns {number}
   */
  countRows({ query = {}, callback = null } = { query: {}, callback: null }) {
    return this.model.count(query, callback);
  }

  /**
   * deleteRows
   * @param {any} -  query, callback = null
   * @returns {[any]}
   */
  deleteRows({ query = {}, callback = null } = { query: {}, callback: null }) {
    return this.model.remove(query, callback);
  }

  /**
   * updateRows
   * @param {any} -  query = {}, data, options = new RequestOptions(), callback = null,
   * @returns {[any]}
   */
  updateRows({
               query = {},
               data,
               options = new RequestOptions(),
               callback = null,
             }) {
    options = _.extend(options, { multi: true });
    return this.model.update(query, data, options, callback);
  }

  updateMany(filter, data, options?): Promise<{ok: number, nModified: number, n: number}> {
    return this.model
      .updateMany(
        filter,
        this.patchUpdateData(data),
        { runValidators: true, omitUndefined: true, context: 'query', ...options },
      )
      .exec();
  }

  patchUpdateData(data) {
    [
      this.performTrackUpdate,
    ].map(mA => mA(this.model, data));

    return data;
  }

  performTrackUpdate(model, data) {
    const schemaOptions = model.schema.baseSchemaOptions;

    return schemaOptions && schemaOptions.trackLastUpdate
      ? schemaOptions.trackLastUpdate.dataAction(data)
      : data;
  }

  /**
   * deleteRow
   * @param {any} -  id, callback = null
   * @returns {any}
   */
  deleteRow({ query = {}, callback = null } = { query: {}, callback: null }) {
    const deferred = q.defer();

    // tslint:disable-next-line
    const Model = this.model;

    Model.findOne(query, (err, doc) => {
      if (err) {
        // tslint:disable-next-line
        callback && callback(err);
        return deferred.reject(err);
      }

      if (!doc) {
        const message = `Entity from model ${
          Model.modelName
        } was not found by query ${JSON.stringify(query)}`;
        const error = new HttpException(message, HttpStatus.NOT_FOUND);
        // tslint:disable-next-line
        callback && callback(error);
        return deferred.reject(error);
      }

      // tslint:disable-next-line
      doc.remove(err => {
        if (err) {
          // tslint:disable-next-line
          callback && callback(err);
          return deferred.reject(err);
        }

        const item = doc.toObject();

        // tslint:disable-next-line
        callback && callback(null, item);
        deferred.resolve(item);
      });
    });

    return deferred.promise;
  }

  /**
   * insertRow
   * @param {any} -  data, callback = null
   * @returns {any}
   */
  insertRow({ data, callback = null, session = null }) {
    const deferred = q.defer();

    // tslint:disable-next-line
    const Model = this.model;

    const doc = new Model(data);
    doc.save((err, item) => {
      if (err) {
        // tslint:disable-next-line
        callback && callback(err);
        return deferred.reject(err);
      }

      item = item.toObject();

      // tslint:disable-next-line
      callback && callback(null, item);
      deferred.resolve(item);
    }, { session });

    return deferred.promise;
  }

  /**
   * insertRow
   * @param {any} -  data, callback = null
   * @returns {[any]}
   */
  insertRows({ data, callback = null }) {
    this.model.insertMany(data, callback);
  }

  findAndUpdateOne(filter, data, options?) {
    return this.model
      .findOneAndUpdate(
        filter,
        this.patchUpdateData(data),
        { new: true, ...options },
      );
  }

  /**
   * insertRow
   * @param {any} -  query = {}, data, callback = null
   * @returns {any}
   */
  updateRow({ query = {}, data, callback = null }) {
    const deferred = q.defer();

    // tslint:disable-next-line
    const Model = this.model;

    Model.findOne(query, (err, doc) => {
      if (err) {
        // tslint:disable-next-line
        callback && callback(err);
        return deferred.reject(err);
      }

      if (!doc) {
        const message = `Entity from model ${
          Model.modelName
        } was not found by query ${JSON.stringify(query)}`;
        const error = new HttpException(message, HttpStatus.NOT_FOUND);
        // tslint:disable-next-line
        callback && callback(error);
        return deferred.reject(error);
      }

      _.extend(doc, _.omit(data, '__v'));
      // tslint:disable-next-line
      doc.save((err, item) => {
        if (err) {
          // tslint:disable-next-line
          callback && callback(err);
          return deferred.reject(err);
        }

        item = item.toObject();

        // tslint:disable-next-line
        callback && callback(null, item);
        deferred.resolve(item);
      });
    });

    return deferred.promise;
  }

  /**
   * findWithOptions
   * @param {any}
   * @returns {[any]}
   */
  findWithOptions(
    {
      query = {},
      options = {
        limit: null,
        pageNumber: null,
        select: null,
        sort: null,
      },
      callback = null,
    } = {
      query: {},
      options: new RequestOptions(),
      callback: null,
    },
  ) {
    const deferred = q.defer();

    let Query = this.model.find(query);

    options.limit = !Number(options.limit)
      ? defaultLimit
      : Number(options.limit);
    options.pageNumber = !Number(options.pageNumber)
      ? defaultPageNumber
      : Number(options.pageNumber);

    if (options.select) {
      Query = Query.select(options.select);
    }

    if (options.sort) {
      const sort =
        typeof options.sort === 'string'
          ? JSON.parse(options.sort)
          : options.sort;
      if (!_.isEmpty(sort)) {
        Query = Query.sort(sort);
      }
    }

    if (options.pageNumber >= defaultPageNumber) {
      Query = Query.skip(options.pageNumber * options.limit).limit(
        options.limit,
      );
    }

    Query.lean().exec((err, results) => {
      if (err) {
        // tslint:disable-next-line
        callback && callback(err);
        return deferred.reject(err);
      }

      // tslint:disable-next-line
      this.model.count(query, (err, count) => {
        if (err) {
          // tslint:disable-next-line
          callback && callback(err);
          return deferred.reject(err);
        }

        const result = {
          pagesCount: Math.ceil(count / options.limit),
          results,
          totalCount: count,
        };

        // tslint:disable-next-line
        callback && callback(null, result);
        deferred.resolve(result);
      });
    });

    return deferred.promise;
  }

  /**
   * aggregateWithOptions
   * @param {any}
   * @returns {[any]}
   */
  aggregateWithOptions(
    { query = [], options = {}, callback = null } = {
      query: [],
      options: new RequestOptions(),
      callback: null,
    },
  ) {
    const deferred = q.defer();

    options.limit = !Number(options.limit)
      ? defaultLimit
      : Number(options.limit);
    options.pageNumber = !Number(options.pageNumber)
      ? defaultPageNumber
      : Number(options.pageNumber);

    if (options.sort) {
      const sort =
        typeof options.sort === 'string'
          ? JSON.parse(options.sort)
          : options.sort;
      _.each(sort, (value, key) => {
        sort[key] = value === 'asc' ? defaultAsc : defaultDesc;
      });
      // tslint:disable-next-line: no-unused-expression
      !_.isEmpty(sort) && query.push({ $sort: sort });
    }

    const countQuery = _.cloneDeep(query);

    if (options.pageNumber >= defaultPageNumber) {
      query.push({ $skip: options.pageNumber * options.limit });
    }

    if (options.limit) {
      query.push({ $limit: options.limit });
    }

    this.model
    .aggregate(query)
    .allowDiskUse(true)
    .exec((err, results) => {
      if (err) {
        // tslint:disable-next-line: no-unused-expression
        callback && callback(err);
        return deferred.reject(err);
      }

      if (!results) {
        const res = {
          pagesCount: defaultPageCount,
          results: [],
          totalCount: defaultTotalCount,
        };
        // tslint:disable-next-line: no-unused-expression
        callback && callback(null, res);
        deferred.resolve(res);
      } else {
        const countquery = [].concat(countQuery, {
          $group: { _id: '1', count: { $sum: 1 } },
        }); // Count request
        this.model
        .aggregate(countquery)
        .allowDiskUse(true)
        // tslint:disable-next-line: no-shadowed-variable
        .exec((err: any, count: any[]) => {
          if (err) {
            // tslint:disable-next-line: no-unused-expression
            callback && callback(err);
            return deferred.reject(err);
          }

          let res;

          if (count && count.length) {
            res = {
              pagesCount: Math.ceil(count[0].count / options.limit),
              results,
              totalCount: count[0].count,
            };
          } else {
            res = {
              pagesCount: 0,
              results,
              totalCount: 0,
            };
          }
          // tslint:disable-next-line: no-unused-expression
          callback && callback(null, res);
          deferred.resolve(res);
        });
      }
    });

    return deferred.promise;
  }
}
