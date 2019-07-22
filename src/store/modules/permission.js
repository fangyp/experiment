import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  /*
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
  */

  generateRoutes({ commit, state }, { roles, menus }) {
    return new Promise(resolve => {
      let accessedRoutes
      accessedRoutes = dataArrayToRoutes(menus)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)

    })
  }
}

function dataArrayToRoutes(data) {
  const res = []
  data.forEach(item => {
    const tmp = { ...item }
    if (tmp.component === 'Layout') {
      tmp.component = Layout
    } else {
      let sub_view = tmp.component
      sub_view = sub_view.replace(/^\/*/g, '')
      tmp.component = () => import(`@/views/${sub_view}`)  //这里很重要，把view动态加载进来，而且似乎我只找到这样的写法，用拼接不行，然后 views 后面没有斜杆也不行
    }
    if (tmp.children) {
      tmp.children = dataArrayToRoutes(tmp.children)
    }
    res.push(tmp)
  })
  return res
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
