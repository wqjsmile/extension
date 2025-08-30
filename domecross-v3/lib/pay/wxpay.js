$(document).ready(function(){
    setTimeout(function(){
        document.getElementById("waiting").style.display="none";
    },10000);

    var pay_type = localStorage.pay_type;
    localStorage.pay_type = "";
    var pay_rrc_id = localStorage.pay_rrc_id?localStorage.pay_rrc_id:0;
    var pay_link=localStorage.pay_link?localStorage.pay_link:0;
    iframeurl = wysubmitpayurl+"?email="+localStorage.email+"&pay_type="+pay_type+"&rrc_id="+pay_rrc_id+"&link="+pay_link;

    $("#wxpay_iframe").attr("src",iframeurl);
});