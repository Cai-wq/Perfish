import Cookies from 'js-cookie'

const TokenKey = 'lzsso_token'
const UserNameKey = 'lzsso_username'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setUserName(userName) {
  Cookies.remove(UserNameKey)
  Cookies.set(UserNameKey, userName)
}

export function getUserName() {
  Cookies.get(UserNameKey)
}

export function goToSSO() {
  const backUrl = escape(window.location.href)
  window.location.href = process.env.SSO_SERVER + '/login?backUrl=' + backUrl
}
