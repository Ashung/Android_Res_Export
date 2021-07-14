const { openURL } = require('./lib/fs');

export default function() {
    const identifier = String(__command.identifier());

    if (identifier === 'web_site') {
        openURL('https://github.com/Ashung/Android_Res_Export')
    }

    if (identifier === 'report_issues') {
        openURL('https://github.com/Ashung/Android_Res_Export/issues')
    }

    if (identifier === 'donate') {
        openURL('http://ashung.github.io/donate.html')
    }

    if (identifier === 'buymeacoffee') {
        openURL('https://www.buymeacoffee.com/ashung')
    }

    if (identifier === 'donate_wechat') {
        openURL('https://github.com/Ashung/ashung.github.io/blob/master/assets/img/donate_wechat_rmb_10.png')
    }

    if (identifier === 'donate_alipay') {
        openURL('https://github.com/Ashung/ashung.github.io/blob/master/assets/img/donate_alipay_rmb_10.png')
    }
}