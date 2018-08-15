require("../jquery-weui/lib/weui.min");
require("../jquery-weui/css/jquery-weui.min");
require("../css/choose");
import weui from "../jquery-weui/js/jquery-weui.min";
import cityPicker from "../jquery-weui/js/city-picker.min";
import FastClick from "../jquery-weui/lib/fastclick";
import validate from "../js/jquery.validate";

$(function() {
    var interval = null;
    var basePath = "http://172.16.0.162:8889/";
    //加载手机号码
    initPhoneNum();

    //身份证号格式验证
    var idCardNoUtil = {
        provinceAndCitys: {
            11: "北京",
            12: "天津",
            13: "河北",
            14: "山西",
            15: "内蒙古",
            21: "辽宁",
            22: "吉林",
            23: "黑龙江",
            31: "上海",
            32: "江苏",
            33: "浙江",
            34: "安徽",
            35: "福建",
            36: "江西",
            37: "山东",
            41: "河南",
            42: "湖北",
            43: "湖南",
            44: "广东",
            45: "广西",
            46: "海南",
            50: "重庆",
            51: "四川",
            52: "贵州",
            53: "云南",
            54: "西藏",
            61: "陕西",
            62: "甘肃",
            63: "青海",
            64: "宁夏",
            65: "新疆",
            71: "台湾",
            81: "香港",
            82: "澳门",
            91: "国外"
        },

        powers: [
            "7",
            "9",
            "10",
            "5",
            "8",
            "4",
            "2",
            "1",
            "6",
            "3",
            "7",
            "9",
            "10",
            "5",
            "8",
            "4",
            "2"
        ],

        parityBit: ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"],

        genders: { male: "男", female: "女" },

        checkAddressCode: function(addressCode) {
            var check = /^[1-9]\d{5}$/.test(addressCode);
            if (!check) return false;
            if (
                idCardNoUtil.provinceAndCitys[
                    parseInt(addressCode.substring(0, 2))
                ]
            ) {
                return true;
            } else {
                return false;
            }
        },

        checkBirthDayCode: function(birDayCode) {
            var check = /^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(
                birDayCode
            );
            if (!check) return false;
            var yyyy = parseInt(birDayCode.substring(0, 4), 10);
            var mm = parseInt(birDayCode.substring(4, 6), 10);
            var dd = parseInt(birDayCode.substring(6), 10);
            var xdata = new Date(yyyy, mm - 1, dd);
            if (xdata > new Date()) {
                return false; //生日不能大于当前日期
            } else if (
                xdata.getFullYear() == yyyy &&
                xdata.getMonth() == mm - 1 &&
                xdata.getDate() == dd
            ) {
                return true;
            } else {
                return false;
            }
        },

        getParityBit: function(idCardNo) {
            var id17 = idCardNo.substring(0, 17);
            var power = 0;
            for (var i = 0; i < 17; i++) {
                power +=
                    parseInt(id17.charAt(i), 10) *
                    parseInt(idCardNoUtil.powers[i]);
            }
            var mod = power % 11;
            return idCardNoUtil.parityBit[mod];
        },

        checkParityBit: function(idCardNo) {
            var parityBit = idCardNo.charAt(17).toUpperCase();
            if (idCardNoUtil.getParityBit(idCardNo) == parityBit) {
                return true;
            } else {
                return false;
            }
        },

        checkIdCardNo: function(idCardNo) {
            //15位和18位身份证号码的基本校验
            var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
            if (!check) return false;

            //判断长度为15位或18位
            if (idCardNo.length == 15) {
                return idCardNoUtil.check15IdCardNo(idCardNo);
            } else if (idCardNo.length == 18) {
                return idCardNoUtil.check18IdCardNo(idCardNo);
            } else {
                return false;
            }
        },

        //校验15位的身份证号码
        check15IdCardNo: function(idCardNo) {
            //15位身份证号码的基本校验
            var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(
                idCardNo
            );
            if (!check) return false;
            //校验地址码
            var addressCode = idCardNo.substring(0, 6);
            check = idCardNoUtil.checkAddressCode(addressCode);
            if (!check) return false;
            var birDayCode = "19" + idCardNo.substring(6, 12);
            //校验日期码
            return idCardNoUtil.checkBirthDayCode(birDayCode);
        },

        //校验18位的身份证号码
        check18IdCardNo: function(idCardNo) {
            //18位身份证号码的基本格式校验
            var check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(
                idCardNo
            );
            if (!check) return false;

            //校验地址码
            var addressCode = idCardNo.substring(0, 6);
            check = idCardNoUtil.checkAddressCode(addressCode);
            if (!check) return false;

            //校验日期码
            var birDayCode = idCardNo.substring(6, 14);
            check = idCardNoUtil.checkBirthDayCode(birDayCode);
            if (!check) return false;

            //验证校检码
            return idCardNoUtil.checkParityBit(idCardNo);
        },
        formateDateCN: function(day) {
            var yyyy = day.substring(0, 4);
            var mm = day.substring(4, 6);
            var dd = day.substring(6);
            return yyyy + "-" + mm + "-" + dd;
        },
        //获取信息
        getIdCardInfo: function(idCardNo) {
            var idCardInfo = {
                gender: "", //性别
                birthday: "" // 出生日期(yyyy-mm-dd)
            };
            if (idCardNo.length == 15) {
                var aday = "19" + idCardNo.substring(6, 12);

                idCardInfo.birthday = idCardNoUtil.formateDateCN(aday);

                if (parseInt(idCardNo.charAt(14)) % 2 == 0) {
                    idCardInfo.gender = idCardNoUtil.genders.female;
                } else {
                    idCardInfo.gender = idCardNoUtil.genders.male;
                }
            } else if (idCardNo.length == 18) {
                var aday = idCardNo.substring(6, 14);

                idCardInfo.birthday = idCardNoUtil.formateDateCN(aday);

                if (parseInt(idCardNo.charAt(16)) % 2 == 0) {
                    idCardInfo.gender = idCardNoUtil.genders.female;
                } else {
                    idCardInfo.gender = idCardNoUtil.genders.male;
                }
            }
            return idCardInfo;
        },

        getId15: function(idCardNo) {
            if (idCardNo.length == 15) {
                return idCardNo;
            } else if (idCardNo.length == 18) {
                return idCardNo.substring(0, 6) + idCardNo.substring(8, 17);
            } else {
                return null;
            }
        },

        getId18: function(idCardNo) {
            if (idCardNo.length == 15) {
                var id17 =
                    idCardNo.substring(0, 6) + "19" + idCardNo.substring(6);
                var parityBit = idCardNoUtil.getParityBit(id17);
                return id17 + parityBit;
            } else if (idCardNo.length == 18) {
                return idCardNo;
            } else {
                return null;
            }
        }
    };
    // 初始化fastclick
    FastClick.attach(document.body);

    //选择号码弹框显示
    $("#chooseNumber").on("click", function() {
        $("#numberChooseModal").addClass("cur");
        $(".mask").removeClass("position");
        $(".mask").addClass("active");
    });
    //弹框关闭
    $(".mask").on("click", function() {
        $("#numberChooseModal").removeClass("cur");
        $(".mask").removeClass("active");
        setTimeout(function() {
            $(".mask").addClass("position");
        }, 400);
    });
    //弹框关闭
    $("#numberChooseModal")
        .on("click", ".btn-close,.select-submit", function() {
            $("#numberChooseModal").removeClass("cur");
            $(".mask").removeClass("active");
            setTimeout(function() {
                $(".mask").addClass("position");
            }, 400);
        })
        .on("click", ".number-item", function() {
            //号码选择事件
            var $this = $(this),
                thisNumber = $this.html();
            $("#numberResult").html(thisNumber);
            $('input[name="chosenNumber"]').val(thisNumber);
            $('input[name="iccid"]').val($this.attr("data-id"));
            $("#numberChooseModal").removeClass("cur");
            $(".mask").removeClass("active");
            setTimeout(function() {
                $(".mask").addClass("position");
            }, 400);
        });
    //手机号码刷新事件
    $("#btnRefresh").on("click", function() {
        initPhoneNum();
    });
    //选择地区
    $("#selectArea").cityPicker({
        title: "请选择地区",
        onChange: function(data) {
            $("#selectArea").html(
                data.displayValue[0] +
                    " " +
                    data.displayValue[1] +
                    " " +
                    data.displayValue[2]
            );
            $('input[name="province"]').val(data.displayValue[0]);
            $('input[name="city"]').val(data.displayValue[1]);
            $('input[name="county"]').val(data.displayValue[2]);
        },
        onClose: function() {
            $(".mask").removeClass("active");
            setTimeout(function() {
                $(".mask").addClass("position");
            }, 400);
        }
    });
    //发送短信验证码
    $(".sedYzm").on("click", function() {
        var $this = $(this);
        var phoneNo = $('input[name="consigneePhoneNo"]').val();
        if ($.trim(phoneNo) == "") {
            $.alert("请输入收货人手机号");
            return;
        }
        if (!checkPhone(phoneNo)) {
            $.alert("请输入正确的收货人手机号");
            return;
        }
        if (!$this.hasClass("disabled")) {
            $this.addClass("disabled");
            $("#submitLoadingToast").fadeIn(100);
            $.ajax({
                type: "POST",
                url: basePath + "chooseNumber/getVerificationCode",
                async: true,
                data: {
                    phoneNo: phoneNo
                },
                dataType: "json",
                success: function(data) {
                    $("#submitLoadingToast").fadeOut(100);
                    if (data.code == "200") {
                        var timer = 60;
                        interval = setInterval(function() {
                            if (timer > 0) {
                                timer--;
                                var str = "再次发送(" + timer + ")";
                                $this.text(str);
                            } else {
                                clearInterval(interval);
                                $this
                                    .removeClass("disabled")
                                    .text("发送验证码");
                            }
                        }, 1000);
                    } else {
                        $.alert("提交失败，请重试");
                        $this.removeClass("disabled");
                    }
                },
                error: function(msg) {
                    $("#submitLoadingToast").fadeOut(100);
                    $.alert("系统异常，请刷新页面重试");
                }
            });
        }
    });
    //表单提交事件
    $("#btnSubmit").on("click", function() {
        var v = $("#form").valid();
        if (!v) {
            return;
        }
        var chosenNumber = $('input[name="chosenNumber"]').val();
        if ($.trim(chosenNumber) == "") {
            $.alert("请选择号码");
            return false;
        }
        var province = $('input[name="province"]').val();
        if ($.trim(province) == "") {
            $.alert("请选择地区");
            return false;
        }
        $("input,textarea").blur();
        $("#submitLoadingToast").fadeIn(100);
        $.ajax({
            type: "POST",
            url: basePath + "chooseNumber/choseNumber",
            async: true,
            data: {
                name: $('input[name="name"]').val(),
                idCardNo: $('input[name="idCardNo"]').val(),
                consignee: $('input[name="consignee"]').val(),
                consigneePhoneNo: $('input[name="consigneePhoneNo"]').val(),
                verificationCode: $('input[name="verificationCode"]').val(),
                province: $('input[name="province"]').val(),
                city: $('input[name="city"]').val(),
                county: $('input[name="county"]').val(),
                address: $('textarea[name="address"]').val(),
                chosenNumber: $('input[name="chosenNumber"]').val()
            },
            dataType: "json",
            success: function(data) {
                $("#submitLoadingToast").fadeOut(100);
                if (data.code == "200") {
                    $(
                        'input[name="name"],input[name="idCardNo"],input[name="consignee"],input[name="consigneePhoneNo"],input[name="verificationCode"],input[name="province"],input[name="city"],input[name="county"],textarea[name="address"]'
                    ).val("");
                    $("#numberResult").html("请选择号码");
                    $("#selectArea").html("请选择地区");
                    resetSendTime();
                    $.alert(
                        "提交成功，点击【确定】进行<br>实名认证",
                        function() {
                            location.href =
                                "/info.html?phone=" +
                                $('input[name="chosenNumber"]').val() +
                                "&iccid=" +
                                $('input[name="iccid"]').val();
                            $('input[name="chosenNumber"]').val("");
                        }
                    );
                } else {
                    $.alert(data.msg);
                }
            },
            error: function(msg) {
                $("#submitLoadingToast").fadeOut(100);
                $.alert("系统异常，请重新提交");
            }
        });
    });

    //表单验证
    $("#form").validate({
        rules: {
            name: {
                required: true
            },
            idCardNo: {
                required: true,
                isIdCardNo: true,
                checkAge: true
            },
            chosenNumber: {
                required: true
            },
            consignee: {
                required: true
            },
            consigneePhoneNo: {
                required: true,
                phone: true
            },
            verificationCode: {
                required: true,
                digits: true
            },
            province: {
                required: true
            },
            city: {
                required: true
            },
            county: {
                required: true
            },
            address: {
                required: true,
                minlength: 5,
                maxlength: 30
            }
        },
        messages: {
            name: {
                required: "请输入开户人姓名"
            },
            idCardNo: {
                required: "请输入开户人身份证号码",
                isIdCardNo: "请输入正确的开户人身份证号码",
                checkAge: "年龄不符"
            },
            chosenNumber: {
                required: "请选择号码"
            },
            consignee: {
                required: "请输入收货人姓名"
            },
            consigneePhoneNo: {
                required: "请输入收货人手机号",
                phone: "请输入正确的收货人手机号"
            },
            verificationCode: {
                required: "请输入短信验证码",
                digits: "请输入正确的短信验证码"
            },
            province: {
                required: "请选择地区"
            },
            city: {
                required: "请选择地区"
            },
            county: {
                required: "请选择地区"
            },
            address: {
                required: "请输入详细地址",
                minlength: "详细地址请输入5-30个字",
                maxlength: "详细地址请输入5-30个字"
            }
        },
        errorPlacement: function(error, element) {
            if ($(".weui-dialog").length) {
                return false;
            } else {
                $.alert(error[0].innerText);
            }
        },
        onfocusout: false,
        onkeyup: false,
        onclick: false
    });

    //添加身份证号格式验证
    jQuery.validator.addMethod(
        "isIdCardNo",
        function(value, element) {
            return idCardNoUtil.checkIdCardNo(value);
        },
        "请正确输入您的身份证号码"
    );

    //身份证号年龄验证
    jQuery.validator.addMethod(
        "checkAge",
        function(value, element) {
            return checkIdCardAge(value);
        },
        "年龄不符"
    );

    //手机号验证
    jQuery.validator.addMethod(
        "phone",
        function(value, element) {
            return checkPhone(value);
        },
        "请正确输入手机号码"
    );

    /**
     * 加载手机号码
     */
    function initPhoneNum() {
        $("#loadingToast").fadeIn(100);
        $.ajax({
            type: "GET",
            url: basePath + "chooseNumber/randomPhoneNumbers",
            async: true,
            data: {},
            dataType: "json",
            success: function(data) {
                $("#loadingToast").fadeOut(100);
                if (data && data.length) {
                    var html = "";
                    for (var i = 0; i < data.length; i++) {
                        html +=
                            '<div class="number-item l" data-id="' +
                            data[i].iccid +
                            '">' +
                            data[i].no +
                            "</div>";
                    }
                    $("#numberList").html(html);
                } else {
                    $.alert("获取手机号码失败，请刷新页面重试");
                    $("#numberList").html("获取手机号码失败，请刷新页面重试");
                }
            },
            error: function(msg) {
                $("#loadingToast").fadeOut(100);
                $.alert("系统异常，请刷新页面重试");
            }
        });
    }

    /**
     * 检查身份证号年龄是否在1994-2004之间
     * @returns {boolean}
     */
    function checkIdCardAge(idCardNo) {
        var birDayCode = idCardNo.substring(6, 12);
        var yyyy = parseInt(birDayCode.substring(0, 4), 10) / 1;
        if (yyyy < 1994 || yyyy > 2004) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 验证手机号
     * @author zhaolq
     * @DateTime 2018-08-15T09:34:10+0800
     * @param    {[String]} 手机号
     * @return   {[boolean]} 检查结果
     */
    function checkPhone(phone) {
        var isPhone = /^1[3|4|5|6|7|8|9][0-9]{9}$/.test(phone);
        if (isPhone) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 重置发送短信验证码
     * @author zhaolq
     * @DateTime 2018-08-15T09:38:25+0800
     */
    function resetSendTime() {
        clearInterval(interval);
        $(".senYzm")
            .removeClass("disabled")
            .text("发送验证码");
    }
});
