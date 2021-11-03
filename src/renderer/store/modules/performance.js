/**
 * Created by CaiWeiQi on 2021/9/2
 */
const getDefaultState = () => {
  return {
    platform: 'iOS',
    cacheApp: {
      iOS: null,
      Android: null
    },
    applicationMap: {}
  }
}

const state = getDefaultState()

const mutations = {
  SET_PLATFORM: (state, platform) => {
    state.platform = platform
  },
  SET_IOS_CACHE_APP: (state, bundleId) => {
    state.cacheApp.iOS = bundleId
  },
  SET_ANDROID_CACHE_APP: (state, packageName) => {
    state.cacheApp.Android = packageName
  },
  SET_CACHE_APP: (state, { platform, packageName }) => {
    state.cacheApp[platform] = packageName
  },
  ADD_APPLICATION_MAP: (state, { packageName, appName }) => {
    state.applicationMap[packageName] = appName
  }
}

const actions = {
  setPlatform({ commit }, platform) {
    commit('SET_PLATFORM', platform)
  },
  setIosCacheApp({ commit }, bundleId) {
    commit('SET_IOS_CACHE_APP', bundleId)
  },
  setAndroidCacheApp({ commit }, packageName) {
    commit('SET_ANDROID_CACHE_APP', packageName)
  },
  setCacheApp({ commit }, { platform, packageName }) {
    commit('SET_CACHE_APP', { platform: platform, packageName: packageName })
  },
  addApplicationMap({ commit }, { packageName, appName }) {
    commit('ADD_APPLICATION_MAP', { packageName: packageName, appName: appName })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
