Date.prototype.format = function(format){ var o = { "M+" : this.getMonth()+1,"d+" : this.getDate(),"h+" : this.getHours(),"m+" : this.getMinutes(),"s+" : this.getSeconds(),"q+" : Math.floor((this.getMonth()+3)/3),"S" : this.getMilliseconds()}; if(/(y+)/.test(format)) { format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); } for(var k in o) { if(new RegExp("("+ k +")").test(format)) { format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); } } return format; }

chrome.cookies.getAll({name:"rrc_id"},function(b){
    for(x in b){
        var domain = b[x].domain;
        if(typeof domain !="undefined"){
            domain=domain.toLowerCase();
            if(domain.indexOf("domecross")!=-1){
                if(domain.indexOf("testdomecross.com")==-1){
                    localStorage.pay_rrc_id=b[x].value;
                }
            }
        }
    }
});

chrome.cookies.getAll({name:"link"},function(b){
    for(x in b){
        var domain = b[x].domain;
        if(typeof domain !="undefined"){
            domain=domain.toLowerCase();
            if(domain.indexOf("domecross")!=-1){
                if(domain.indexOf("testdomecross.com")==-1){
                    localStorage.pay_link=b[x].value;
                }
            }
        }
    }
});

$(document).ready(function(){
    $("#pay_submit_button").click(function(){
        var paymethod = $(".paymethod:checked").val();
        if(paymethod<2){
            //支付宝
            localStorage.pay_type = $("#scp_pay_type").val();
            var pay_rrc_id = localStorage.pay_rrc_id?localStorage.pay_rrc_id:0;
            var pay_link=localStorage.pay_link?localStorage.pay_link:0;
            window.location.href=submitpayurl+"?email="+localStorage.email+"&pay_type="+$("#scp_pay_type").val()+"&rrc_id="+pay_rrc_id+"&link="+pay_link;
            return false;
        }else{
            //微信支付
            localStorage.pay_type = $("#scp_pay_type").val();
            window.location.href="wxpay.html";
            return false;
        }
    });


    $(".by").on('click', function () {
        $('#confirmDefault').modal('show');
        var price = $(this).attr("price");
        var days = parseInt($(this).attr("days"));
        var paytype = $(this).attr("paytype");
        //判断是否登录
        if(!localStorage.email){
            location.href=login_url;
        }else{
            var now = new Date();
            var expire_after;

            //已登录
            $("#confirmDefault").modal({show:true});

            //email
            $("#scp_email1").val(localStorage.email);
            $("#scp_email2").html(localStorage.email);

            //vip级别和过期时间
            $("#scp_vip").html("VIP");
            if(localStorage.level!=='1')$("#scp_vip").html("非VIP");
            if(localStorage.expire && localStorage.level==='1'){
                now = new Date(localStorage.expire);
                now2 = now.format("yyyy-MM-dd");
                $("#scp_expire").html(now2);
            }else{
                $("#scp_expire").html("-");
            }
            //time 服务时间
            $("#scp_time").html(days+"天");

            //expire_after 服务延长时间
            now = Date.parse(now);
            expire_after = now+24*3600*days*1000;
            expire_after = new Date(expire_after);
            $("#scp_expire_after").html(expire_after.format("yyyy-MM-dd"));

            //price 应付总额
            $("#scp_price").html(price);
            $("#scp_pay_type").val(paytype);
            $('#confirmDefault').modal('show');
        }
    });
});