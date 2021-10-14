/**
 * Created by CaiWeiQi on 2021/9/2
 */
const getDefaultState = () => {
  return {
    platform: 'iOS'
  }
}

const state = getDefaultState()

const mutations = {
  SET_PLATFORM: (state, platform) => {
    state.platform = platform
  }
}

const actions = {
  setPlatform({ commit }, platform) {
    commit('SET_PLATFORM', platform)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
