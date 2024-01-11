const LocalStorage = {
    /**
     * Determine if browser supports local storage.
     * 
     * @return {boolean}
     */
    isSupported() {
      return typeof Storage !== 'undefined';
    },
  
    /**
     * Check if key exists in local storage.
     *
     * @param {string} key
     * @return {boolean}
     */
    has(key) {
      return window.localStorage.hasOwnProperty(key);
    },
  
    /**
     * Retrieve an object from local storage.
     *
     * @param {string} key
     * @return {any}
     */
    get(key) {
      let item = window.localStorage.getItem(key);
    
      if (typeof item !== 'string') return item;
    
      if (item === 'undefined') return undefined;
    
      if (item === 'null') return null;
    
      // Check for numbers and floats
      if (/^'-?\d{1,}?\.?\d{1,}'$/.test(item)) return Number(item);
    
      // Check for numbers in scientific notation
      if (/^'-?\d{1}\.\d+e\+\d{2}'$/.test(item)) return Number(item);
    
      // Check for serialized objects and arrays
      if (item[0] === '{' || item[0] === '[') return JSON.parse(item);
    
      return item;
    },
  
    /**
     * Save some value to local storage.
     *
     * @param {string} key
     * @param {any} value
     * @return {void}
     */
    set(key, value) {
      if (typeof key !== 'string') {
        throw new TypeError(`localStorage: Key must be a string. (reading '${key}')`)
      }
    
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
    
      window.localStorage.setItem(key, value);
    },
  
    /**
     * Remove element from local storage.
     *
     * @param {string} key
     * @return {void}
     */
    remove(key) {
      window.localStorage.removeItem(key);
    },
  };

  export default LocalStorage;