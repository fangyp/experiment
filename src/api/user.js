import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

// 从服务端获取当前登录用户的菜单/权限列表
export function getMenus(token) {
  return request({
    url: '/user/menus',
    method: 'get',
    params: { token }
  })
}
