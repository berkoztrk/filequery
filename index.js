import _ from 'lodash';
import extensions from './extensions/extensions';
import fs from 'fs';
import util from 'util';
import _glob from 'glob';

const glob = util.promisify(_glob);
const ALL = '*';
const OPERATORS = {
  GT: '$gt',
  EQ: '$eq',
  LT: '$lt',
};
const SIZE_TYPES = {
  BYTE: '$BYTE',
  KB: '$KB',
  MB: '$MB',
  GB: '$GB',
};
const DEFAULTS = {
  isRecursive: false,
  includeBaseDirectoryOnReturn: true,
  extension: ALL,
  fileType: ALL,
  sizeQuery: '$gt 0 $BYTE',
};
let instance = null;


/** Main filequery class */
class FileQuery {
  /**
   * Constructor
   */
  constructor() {
    this.glob = glob;
  }
  /**
   * Singleton instance getter
   * @return {FileQuery}
   */
  static getInstance() {
    if (!instance) {
      instance = new FileQuery();
    }
    return instance;
  }
  /**
   * Query folder
   * @param {object} opts - query options
   */
  async query(opts) {
    opts = this._preQuery(opts);
    const searchPattern = this._getSearchPatternAccordingToRecursive(opts);
    let files = await this._searchAll(searchPattern);

    if (!opts.returnFolders) {
      files = _.filter(files, this._isFile);
    }

    if (!opts.includeBaseDirectoryOnReturn) {
      files = _.map(files, (item) => item.replace(opts.directory, ''));
    }

    if (!opts.sizeQuery !== DEFAULTS.sizeQuery) {
      files = _.filter(files, (file) => this._sizeFilter(file, opts.sizeQuery));
    }

    return files;
  }
  /**
   * @param  {object} opts - query options
   * @return {object} opts - query options
   */
  _preQuery(opts) {
    if (!this._existsInOptionAndNotEmpty(opts, 'directory')) {
      throw new Error('directory property is required');
    } else if (this._existsInOptionAndNotEmpty(opts, 'directory')
               && !fs.existsSync(opts.directory)) {
      throw new Error(`directory ${opts.directory} 
      does not exists on the file system.`);
    } else if (!opts.directory.endsWith('/')) {
      opts.directory += '/';
    } if (!this._existsInOptionAndNotEmpty(opts, 'isRecursive')) {
      opts.isRecursive = DEFAULTS.isRecursive;
    } if (!this._existsInOptionAndNotEmpty(opts, 'includeBaseDirectoryOnReturn')) {
      opts.includeBaseDirectoryOnReturn = DEFAULTS.includeBaseDirectoryOnReturn;
    } if (!this._existsInOptionAndNotEmpty(opts, 'fileType')) {
      opts.fileType = DEFAULTS.fileType;
    } if (!this._existsInOptionAndNotEmpty(opts, 'returnFolders')) {
      opts.returnFolders = DEFAULTS.returnFolders;
    } if (!this._existsInOptionAndNotEmpty(opts, 'extension')) {
      opts.extension = DEFAULTS.extension;
    } if (!this._existsInOptionAndNotEmpty(opts, 'sizeQuery')) {
      opts.sizeQuery = DEFAULTS.sizeQuery;
    }
    return opts;
  }
  /**
   * @param  {object} options - query options
   * @param  {string} key - query option key
   * @return {boolean}
   */
  _existsInOptionAndNotEmpty(options, key) {
    return _.has(options, key) && typeof options[key] !== 'undefined';
  }
  /**
   * @param  {object} opts - Query options
   * @return {string} - Search pattern if its recursive or not
   */
  _getSearchPatternAccordingToRecursive(opts) {
    let query = opts.directory;
    if (opts.isRecursive) {
      query += '**/*';
    } else {
      query += '*';
    }

    if (opts.fileType !== ALL) {
      query += `.{${extensions[opts.fileType].join(',')}}`;
    } else if (opts.extension !== DEFAULTS.extension) {
      query += opts.extension;
    }
    return query;
  }
  /**
   * @param  {string} pattern - Glob search pattern
   */
  async _searchAll(pattern) {
    try {
      const files = await glob(pattern);
      return files;
    } catch (error) {
      throw new Error(error);
    }
  }
  /**
   * @param  {string} path - File path
   * @return {boolean} isFile
   */
  _isFile(path) {
    return !fs.lstatSync(path).isDirectory();
  }
  /**
   * @param  {string} path - File path
   * @param  {string} query - Size query
   * @return {boolean} - Is size query matching
   */
  _sizeFilter(path, query) {
    const fileSizeInBytes = fs.statSync(path)['size'];
    const operator = this._parseOperator(query);
    const fileSizeType = this._parseFileSizeType(query);
    const fileSize = this._convertFileSize(fileSizeInBytes, fileSizeType);
    const queryAmount = this._parseSizeAmount(query);
    if (operator === OPERATORS.GT) {
      return fileSize > queryAmount;
    } else if (operator === OPERATORS.EQ) {
      return fileSize === queryAmount;
    } else if (operator === OPERATORS.LT) {
      return fileSize < queryAmount;
    }
  }
  /**
   * @param  {string} query - Query to be parsed
   * @return {string} operator - Parsed operator
   */
  _parseOperator(query) {
    return _.head(query.split(' '));
  }
  /**
   * @param  {string} query - Query to be parsed
   * @return {string} operator - Parsed operator
   */
  _parseFileSizeType(query) {
    return _.last(query.split(' '));
  }
  /**
   * @param  {string} query - Query to be parsed
   * @return {Number} size  - Size in query
   */
  _parseSizeAmount(query) {
    return parseInt(_.nth(query.split(' '), 1));
  }
  /**
   * @param  {Number} inBytes
   * @param  {string} type
   * @return  {Number} fileSize - converted file size
   */
  _convertFileSize(inBytes, type) {
    if (type === SIZE_TYPES.BYTE || typeof type === 'undefined') {
      return inBytes;
    } else if (type === SIZE_TYPES.KB) {
      return inBytes / Math.pow(1024, 1);
    } else if (type === SIZE_TYPES.MB) {
      return inBytes / Math.pow(1024, 2);
    } else if (type === SIZE_TYPES.GB) {
      return inBytes / Math.pow(1024, 3);
    }
  }
}

export default FileQuery.getInstance();
