// import $ from 'jquery'
// import * as poppyjs from 'poppyjs-elem'
import { common } from './common'
import admin from './admin/index'
/*
(() => {
    // 需要laravel设置在header头中，然后js来调用。 例如：
    // <meta name="csrf-token" content="{{ csrf_token() }}">
    var csrfToken = $('meta[name="csrf-token"]').attr('content');
    if (! poppyjs.util.StringUtil.isEmpty(csrfToken)) {
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': csrfToken
            }
        });
    }

    $(function() {
        if ($("[data-show-datepicker='yes']").datepicker) {
            $("[data-show-datepicker='yes']").datepicker(hw.config.DefaultBootstrapDatepickerConfig);
        }

        if ($().timepicker) {
            $("[data-show-timepicker='yes']").timepicker({
                showInputs: false,
                minuteStep: 15, // NOTE：全局设置步长为15分钟。如果个别页面要定制其它值，请在个页面里覆盖该属性。
                showSeconds: false,
                secondStep: 1,
                defaultTime: false,
                showMeridian: false
            });
        }

        if ($.blockUI) {
            $.blockUI.defaults.css = {
                padding: 0,
                margin: 0,
                width: '30%',
                top: '40%',
                left: '35%',
                textAlign: 'center',
                color: '#fff',
                border: '0',
                cursor: 'wait'
            };
        }

    });
})();
*/

export default {
	common: common,
	admin: admin
}

