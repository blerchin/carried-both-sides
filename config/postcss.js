'use strict';

// Package modules.
const autoprefixer = require('autoprefixer');
const easySprite = require('postcss-easysprites');

// Exports.
module.exports = {
  plugins: () => [
    easySprite({ spritePath: '.tmp/' }),
    autoprefixer
  ]
};
