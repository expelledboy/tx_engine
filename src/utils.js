function isObject (value) {
  return value && typeof value === 'object' && value.constructor === Object
}

const assocEvolve = (obj, data) => {
  const _ = data // eslint-disable-line

  const scan = (src, dest) => Object
    .entries(src)
    .forEach(([key, value]) => {
      if (key.startsWith('_')) { // ratify key value from data
        try {
          value = eval(value) // eslint-disable-line
          key = key.replace(/^_/, '')
          dest[key] = value
        } catch (e) {
          throw new Error(`path ${value} not found in data`)
        }
      } else if (isObject(value)) { // recursively apply to sub object
        const sub = dest[key] = {}
        scan(value, sub)
      } else { // simple value, simple assign
        dest[key] = value
      }
    })

  const result = {}
  scan(obj, result)
  return result
}

module.exports = {
  assocEvolve
}
