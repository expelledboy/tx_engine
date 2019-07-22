function isObject (value) {
  return value && typeof value === 'object' && value.constructor === Object;
}

const assocEvolve = (obj, data) => {
  const $ = data;

  const scan = (src, dest) => Object
    .entries(src)
    .forEach(([key, value]) => {

      // ratify key value from data
      if (key.startsWith('$')) {
        try {
          value = eval(value);
          key = key.replace(/^\$/, '');
          dest[key] = value;
        } catch (e) {
          throw new Error(`path ${value} not found in data`)
        }
      }

      // recursively apply to sub object
      else if (isObject(value)) {
        const sub = dest[key] = {};
        scan(value, sub)
      }

      // simple value, simple assign
      else {
        dest[key] = value;
      }

    });

  const result = {};
  scan(obj, result);
  return result;
};

module.exports = {
  assocEvolve,
}
