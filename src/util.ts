const objectFilter = function (data, fn) {
  const result = {}

  Object.keys(data).forEach(key => {
    if (fn(data[key], key, data)) {
      result[key] = data[key]
    }
  })

  return result
}

export default {
  isValidDateTime(str) {
    return /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/.test(
      str,
    )
  },
  typeOf(mixed) {
    return Object.prototype.toString.call(mixed).slice(8, -1)
  },
  objectFilter,
}
