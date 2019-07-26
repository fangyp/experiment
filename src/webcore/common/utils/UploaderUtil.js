import $ from 'jquery'
import * as poppy from 'poppyjs-elem'

class UploaderUtil {

    /**
     * 初始化一个uploader组件
     * @param button 按钮元素id
     * @param imgElement 图片元素selector
     * @param uploadType 上传业务类型
     */
    static initUploader(options) {
        var initOpts = $.extend({
            apiUrl: HW_ADMIN_URL + '/admin-api/upload',
            flash_swf_url : HW_COMMON_RES_URL + '/libs/plupload-2.3.6/js/Moxie.swf',
            silverlight_xap_url : HW_COMMON_RES_URL + '/libs/plupload-2.3.6/js/Moxie.xap',
        }, options);
        if (typeof(initOpts.uploadType) == 'undefined' || poppy.util.StringUtil.isEmpty(initOpts.uploadType)) {
            initOpts.uploadType = 'generic';
        }
        poppy.biz.Uploader.init(initOpts);
   }
}

export {UploaderUtil}
export default UploaderUtil