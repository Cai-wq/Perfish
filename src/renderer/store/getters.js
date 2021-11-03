const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  userInfo: state => {
    return {
      name: state.user.name,
      email: state.user.email,
      account: state.user.account,
      avatar: state.user.avatar
    }
  },
  roles: state => state.user.roles,
  platform: state => state.performance.platform,
  performance: state => state.performance
}
export default getters
