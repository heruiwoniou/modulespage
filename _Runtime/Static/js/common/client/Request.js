/**
 * Author:Herui/Administrator;
 * CreateDate:2016/2/16
 *
 * Describe:
 */

define(function() {
    var request = {};
    var ps = window.location.search;
    if (!ps) return request;
    var reg = /[?&]*([^=]+)=([^&=]+)/ig, m
    while ((m = reg.exec(ps)))
    {
        request[m[1]]=m[2];
    }
    return request;
})