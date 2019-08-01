import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
	return Cookies.get(TokenKey)
}

export function setToken(token) {
	return Cookies.set(TokenKey, token)
}

export function removeToken() {
	return Cookies.remove(TokenKey)
}

const kUserAccountKey = 'User-Account-Key'

export function getUserInfo() {
	try {
		const infoString = localStorage.getItem(kUserAccountKey) || '{}'
		return JSON.parse(infoString) || {}
	} catch (error) {
		return {}
	}
}
export function setUserInfo(info) {
	try {
		localStorage.setItem(kUserAccountKey, JSON.stringify(info))
	} catch (error) {
		console.log(error)
	}
}
export function removeUserInfo() {
	localStorage.removeItem(kUserAccountKey)
}
