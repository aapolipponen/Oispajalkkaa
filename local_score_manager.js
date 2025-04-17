const fakeStorage = {
  _data: {},
  setItem(id, val) { return this._data[id] = String(val) },
  getItem(id) { return this._data[id] },
  removeItem(id) { return delete this._data[id] },
  clear() { return this._data = {} }
};

class LocalScoreManager {
  constructor() {
    this.key = "bestScore";
    this.storage = this.localStorageSupported ? window.localStorage : fakeStorage;
  }

  get localStorageSupported() {
    try {
      const testKey = "__test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  get() {
    return Number(this.storage.getItem(this.key)) || 0;
  }

  set(score) {
    this.storage.setItem(this.key, score);
  }
}