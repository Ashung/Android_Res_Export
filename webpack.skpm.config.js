module.exports = function (config, entry) {
    config.devtool = 'none';
    config.node = entry.isPluginCommand ? false : {
        setImmediate: false
    };
    config.mode = 'production';
    config.module.rules.push({
        test: /\.(html)$/,
        use: [{
            loader: "@skpm/extract-loader",
        },
        {
            loader: "html-loader",
            options: {
            attrs: [
                'img:src',
                'link:href'
            ],
            interpolate: true,
            },
        },
        ]
    });
    config.module.rules.push({
        test: /\.(css)$/,
        use: [{
            loader: "@skpm/extract-loader",
        },
        {
            loader: "css-loader",
        },
        ]
    });
}
