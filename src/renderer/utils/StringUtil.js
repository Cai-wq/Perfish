/**
 * Created by CaiWeiQi on 2021/12/8
 */

/**
 * 获取字符串Hash
 * @param {string} str 字符串
 * @param {boolean} caseSensitive 忽略大小写
 * @return {number}
 */
export function getHashCode(str, caseSensitive) {
  if (!caseSensitive) {
    str = str.toLowerCase()
  }
  let hash = 1315423911
  let i, ch
  for (i = str.length - 1; i >= 0; i--) {
    ch = str.charCodeAt(i)
    hash ^= ((hash << 5) + ch + (hash >> 2))
  }
  return (hash & 0x7FFFFFFF)
}

/**
 * 字符串判空
 * @param {string} str
 * @returns {boolean}
 */
export function isEmpty(str) {
  return str === undefined || str == null || str === ''
}

/**
 * 字符串判空
 * @param {string} str
 * @returns {boolean}
 */
export function isNotEmpty(str) {
  return !isEmpty(str)
}
