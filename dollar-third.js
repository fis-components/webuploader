/**
 * @fileOverview jQuery or Zepto
 */


var $ = window.__dollar || window.jQuery || window.Zepto;
if (!$) {
    throw new Error('jQuery or Zepto not found!');
}
module.exports = $ || module.exports;;