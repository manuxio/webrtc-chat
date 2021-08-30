export default class JsonReply {
  constructor(data, error = false) {
    this._data = data;
    this._error = error;
  }
  set error (t) {
    this._error = t;
  }
  get error () {
    return this._error || false;
  }
  set data (t) {
    this._data = t;
  }
  get data () {
    return this._data;
  }
  toJSON() {
    if (this.error) {
      let msg = '';
      if (this.error instanceof Error) {
        msg = this.error.message;
      }
      if (typeof this.error === 'string') {
        msg = this.error;
      }
      if (typeof this.error === 'number') {
        msg = `Unexpected error ${this.error}`;
      }
      const retval = {
        error: true,
        errorMessage: msg
      };
      return retval;
    }
    const retval = {
      error: false,
      result: this._data
    };
    return retval;
  }
}