# **框架使用说明**

## **目录说明**

## **如何编写基础api调用方法**
调用服务端接口的方法单独封装在 `/src/api/` 下，按照数据的类型划分成单独文件，每个文件包含该数据的相关接口方法。
> 参见： src/api/user.js


## **内部三方库 `poppyjs-elem`**
参见package.json，`"poppyjs-elem": "0.1.0"`。 引用方法：
```
import poppyjs from 'poppyjs-elem'

// 显示loading提示
poppyjs.html.Dialog.showLoading()
```

## **内部二方库 `webcore`**
库里共享了一些共用代码，位置： `/src/webcore`。 引用方法：
```
import webcore from '@/webcore'

// 请求后端接口
webcore.admin.Service.request({
  url: '/user/info',
  showSuccessMsg: false,
  showErrorMsg: true,
  showLoading: true
})
```
> 参见： src/api/user.js


## **如何编写页面**
* 页面放在 `/src/pages/` 中
* 页面包含两个文件： 
  * xxxx_page.js ：全小写，用下划线分隔单词，文件名以"_page"结尾，编译时按照该结尾解析。
  * xxxxx.vue ：vue模板文件名参照vue官方标砖，按驼峰命名，例如： “UserInfo.vue”。


## **全局环境变量**
### env环境变量
* process.env.VUE_APP_API_HOST: api接口服务根地址
* process.env.VUE_APP_BASE_URL: 后台页面根url，相对路径
  * 在vue页面或组件中使用： this.$store.state.app.config.baseUrl
* process.env.VUE_APP_ADMIN_URL: 后台admin板块页面根url，相对路径
  * 在vue页面或组件中使用： this.$store.state.app.config.adminUrl
* process.env.VUE_APP_BASE_API: api接口服务根url，相对路径
* process.env.VUE_APP_AUTH_API: api接口服务权限认证url，相对路径


## **webcore库参考**
> 引入：  import webcore from '@/webcore'

### **调用服务接口**
`webcore.admin.Service.request(options)`

> 本方法只支持Promise的回调方式。
> 

#### *参数options*

* `url`: string, 必需。请求的url相对路径，注意前面要加上"/"，比如："/user/info"。
* `method`: string, 可选。支持get、post、delete、update等。 默认为post。
* `params`: object, 可选。请求参数列表，值对形式。
* `successMsg`: string | boolean, 可选。显示的成功信息，如果设置为false，则不显示成功消息弹框。默认：false。
* `showErrorMsg`: boolean, 可选。当发生错误时是否显示错误信息框，比如服务端返回业务错误。默认：true。
* `showLoading`: boolean, 可选。是否显示加载提示，比如请求数据时显示的loading。 默认：true。
* `autoRefresh`: boolean，可选。是否是自动刷新提交的请求。默认：false。对于自动刷新请求，服务端做了一些特殊处理，因此要加入这个标志。自动刷新的场景，如：每分钟自动保存数据、页面定时刷新等。

#### *调用举例*
```
function getMenus() {
	// 这里返回的是一个 Promise对象
	return webcore.admin.Service.request({
		url: '/menu/list',
		showSuccessMsg: false,
		showErrorMsg: true,
		showLoading: true
	})
}


// 调用getMenus()，回调要写在 then() 和 catch() 中
getMenus().then(response => {
	const { data } = response
	if (!data) {
		reject('Verification failed, please Login again.')
	}

	const menus = data

	// roles must be a non-empty array
	if (!menus || menus.length <= 0) {
		reject('getMenus: menus must be a non-null array!')
	}

	commit('SET_MENUS', menus)
	resolve(menus)
}).catch(error => {
	reject(error)
})
```


### **基本页面跳转**
> 基于后端根路径跳转。即基于`env.VUE_APP_BASE_URL`的页面跳转

`webcore.common.util.NetUtil.redirect(uri)`

#### *参数*

* uri: string, 必需。请求的url相对路径，注意前面要加上"/"，比如："/auth/login"。

#### *调用举例*
```
// 比如调用登录接口，登录作为权限认证板块的action，是独立于admin板块的。
webcore.common.util.NetUtil.redirect('/auth/login')
```


### **admin页面跳转**
> 基于后端admin板块路径跳转。即基于`env.VUE_APP_ADMIN_URL`的页面跳转

`webcore.common.util.NetUtil.adminRedirect(uri)`

#### *参数*

* uri: string, 必需。请求的url相对路径，注意前面要加上"/"，比如："/user/info"。

#### *调用举例*
```
webcore.common.util.NetUtil.redirect('/user/info')
```


## **自定义公用样式库**
样式库文件：`src/styles/my_common.scss`

### **边距**

类名： `.mg-XX-YY`，XX为方向，YY为尺寸。

根据方向共有5种：
* 四周边距时，XX部分不写
* `t`: 上边距
* `b`: 下边距
* `l`: 左边距
* `r`: 右边距

根据边距大小共有5种尺寸：
* `xs`: 微小
* `sm`: 小
* `md`: 中等
* `lg`: 大
* `0`: 无边距

例如： 
```
<div class="mg-xs">hellow</div> <!-- 四周微小边距 -->

<div class="mg-0">hellow</div> <!-- 四周无边距 -->

<div class="mg-t-md">hellow</div> <!-- 上侧中等边距 -->

<div class="mg-l-0">hellow</div> <!-- 左侧无边距 -->
```

### **内留白(填充)**

类名： `.pad-XX-YY`，XX为方向，YY为尺寸。

根据方向共有5种：
* 四周边距时，XX部分不写
* `t`: 上边距
* `b`: 下边距
* `l`: 左边距
* `r`: 右边距

根据边距大小共有5种尺寸：
* `xs`: 微小
* `sm`: 小
* `md`: 中等
* `lg`: 大
* `0`: 无边距

例如： 
```
<div class="pad-xs">hellow</div> <!-- 四周微小边距 -->

<div class="pad-0">hellow</div> <!-- 四周无边距 -->

<div class="pad-t-md">hellow</div> <!-- 上侧中等边距 -->

<div class="pad-l-0">hellow</div> <!-- 左侧无边距 -->
```

### **文字样式**

* `.small`: 小尺寸号

* `.text-left`: 文字水平左对齐
* `.text-center`:  文字水平居中对齐
* `.text-right`:  文字水平右对齐
* `.text-major`: 主要颜色
* `.text-general`: 一般颜色
* `.text-minor`: 次要颜色
* `.text-placeholder`: 占位颜色
* `.text-ellipsis`: 省略文字。当文字较多时，不想显示全部，显示前几个字，其余用“...”代替
