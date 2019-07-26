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