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
        openURL('https://www.paypal.me/ashung/5')
    }

    if (identifier === 'buymeacoffee') {
        openURL('https://www.buymeacoffee.com/ashung')
    }

}