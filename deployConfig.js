var babelCompatibility = {
  presets: ['env', 'stage-0', "react"]
}

var babelDev = {
  presets: ["react"],
  plugins: [
    'transform-do-expressions',
    'transform-object-rest-spread',
    'transform-class-properties',
    'transform-es2015-modules-commonjs'
  ]
}


var presets = {
  production: {
    baseUrl: '/members/prep/',
    apiBaseUrl: 'https://apps.crossref.org/prep/data',
    babelConfig: babelCompatibility
  },

  staging: {
    baseUrl: '/prep-staging/',
    apiBaseUrl: 'https://apps.crossref.org/prep-staging/data',
    babelConfig: babelDev
  },

  cwts: {
    baseUrl: '/crossref-participation-reports/',
    apiBaseUrl: 'https://apps.crossref.org/prep/data',
    babelConfig: babelCompatibility
  }
}

//Set preset here:
module.exports = presets.cwts
