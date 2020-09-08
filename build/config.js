module.exports = {
    sass: {
        src: "app/styles/**/*.scss"
    },

    js: {
        src: "app/scripts/**/*.js"
    },

    html: {
        src: "app/pages/**/*.+(html|nunjucks)"
    },

    images: {
        src: "app/images/**/*"
    },

    autoprefixer: {
        overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR']
    },

    copy: {
        src: [
            'app/**/*.unitypackage',
            'app/**/*.zip'
        ]
    },

    imagemin: {
        progressive: true,
        interlaced: true,
        svgoPlugins: [{cleanupIDs: false}],    // don't remove IDs from SVGs, they are often used as hooks for embedding and styling
    },
};