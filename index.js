var $ = mdui.$;

const API = "https://fc-resource-node-api.pbox.cloud/api/v1/pan/search?";
const DETAIL_API = "https://fc-resource-node-api.pbox.cloud/api/v1/pan/detail?id={0}";
const URL_API = "https://fc-resource-node-api.pbox.cloud/api/v1/pan/url?t={0}&id={1}";
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlvbmlkIjoib1RJWk02QWg2cTFMZWc5ZGNxSmEzRkJ6bnE1WSIsImlhdCI6MTY4OTMxOTkxNywiZXhwIjoxNjg5OTI0NzE3fQ.kElpf5WYH3KJ_2jrxCR1EWtWxj79-FiW6yksjxso-b4'
const SEARCH_VERSION = "v2";
const FILTER_ITEMS = [
    [".filter-source", "resType"],
    [".filter-item", "searchType"],
    [".filter-type", "category"],
    [".filter-size", "minSize", "maxSize"]
];
const ITEMS_ICON = [
    "folder_open",
    "videocam",
    "music_note",
    "photo",
    "book",
    "settings_applications",
    "archive",
    "attachment"
]
var current_page = 1;
var url_list = {};

var resource_html = "";
    resource_html += "<div class=\"resource-card fl-center\">\n";
    resource_html += "  <i class=\"mdui-icon material-icons\">{0}<\/i>\n";
    resource_html += "  <div class=\"resource-info\">\n";
    resource_html += "    <a class=\"mdui-typo-title\" href=\"javascript:UrlJump('{4}');\">{1}<\/a>\n";
    resource_html += "    <div class=\"mdui-typo\">\n";
    resource_html += "      <pre>{2}<\/pre>\n";
    resource_html += "    <\/div>\n";
    resource_html += "  <\/div>\n";
    resource_html += "  <div class=\"resource-time fl-center\">\n";
    resource_html += "    <div class=\"mdui-typo-subheading-opacity\">{3}<\/div>\n";
    resource_html += "  <\/div>\n";
    resource_html += "<\/div>\n";
    resource_html += "\n";

var load_more_html = "";
    load_more_html += "<div class=\"mdui-col load-more\">\n";
    load_more_html += "  <button\n";
    load_more_html += "    class=\"mdui-btn mdui-btn-block mdui-color-theme-accent mdui-ripple\"\n";
    load_more_html += "    onclick=\"load_more();\"\n";
    load_more_html += "  >\n";
    load_more_html += "    加载更多\n";
    load_more_html += "  <\/button>\n";
    load_more_html += "<\/div>\n";
    load_more_html += "\n";

String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof args == "object") {
        for (var key in args) {
            if (args[key] != undefined) {
            var reg = new RegExp("({" + key + "})", "g");
            result = result.replace(reg, args[key]);
            }
        }
        } else {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] != undefined) {
                var reg = new RegExp("({[" + i + "]})", "g");
                result = result.replace(reg, arguments[i]);
            }
            }
        }
    }
    return result;
};

$(".search-btn").on("click", _on_search_btn_clicked);
$(".search-progress").hide();
$(".resource").hide();

function _on_search_btn_clicked(){
    $(".search-progress").show();
    $(".resource").hide();
    current_page = 1;
    $(".resource").empty();
    FILTER_ITEMS.forEach(array => {
        if($(array[0]).val() != "None") {
            if(array.length == 2){
                url_list[array[1]] = $(array[0]).val();
            }
            else {
                var array_list = $(array[0]).val().split(",");
                url_list[array[1]] = array_list[0];
                url_list[array[2]] = array_list[1];
            }
        }
    });
    url_list["version"] = SEARCH_VERSION;
    url_list["kw"] = $(".search-input").val();
    if(url_list["kw"].replace(/\s*/g,"") == ""){
        mdui.alert('搜索内容不可为空', 'Lipanso');
        return;
    }
    url_list["page"] = current_page;

    _search($.param(url_list));
}

function load_more(){
    current_page += 1;
    url_list["page"] = current_page;
    _search($.param(url_list));
    $(".load-more").remove();
}

function UrlJump(id){
    mdui.snackbar({
        message: '正在获取链接...',
        position: 'right-top',
        timeout: 3000
    });
    $.ajax({
        method: 'GET',
        url: DETAIL_API.format(id),
        success: function (data) {
            data = JSON.parse(data);
            var haspwd = data.haspwd;
            var pwd = (haspwd)?data.pwd:null;
            var t = (new Date).getTime();

            $.ajax({
                method: 'GET',
                url: URL_API.format(t, id),
                headers: {
                    "X-Authorization": TOKEN
                },
                success: function (data) {
                    data = JSON.parse(data);
                    var url = (pwd)?data.data + "?pwd=" + pwd:data.data;
                    window.open(url);
                },
                error: function (xhr, textStatus) {
                    mdui.snackbar({
                        message: '请求错误:' + textStatus,
                        position: 'right-bottom',
                        timeout: 3000
                    });
                }
            });
        },
        error: function (xhr, textStatus) {
            mdui.snackbar({
                message: '请求错误:' + textStatus,
                position: 'right-bottom',
                timeout: 3000
            });
        }
    });
}

function _search(params){
    $.ajax({
        method: 'GET',
        url: API + params,
        success: function (data) {
            $(".search-progress").hide();
            $(".resource").show();
            data = JSON.parse(data);
            if(data.resources){
                mdui.snackbar({
                    message: '共搜索到 {0} 个结果'.format(data.total),
                    position: 'left-top',
                    timeout: 4000
                });
                data.resources.forEach(res => {
                    $(".resource").append(resource_html.format(
                        ITEMS_ICON[(res.res.category == null)?0:res.res.category],
                        res.res.filename,
                        res["highs"]["filelist.filename"].join("\n"),
                        res.res.utime,
                        res.res.id
                    ));
                });
                $(".resource").append(load_more_html);
            }
            else {
                if(current_page != 1){
                    mdui.snackbar({
                        message: '没有更多了~',
                        position: 'bottom',
                        timeout: 3000
                    });
                }
                else if($(".filter-item").val() == "precise"){
                    var sb = mdui.snackbar({
                        message: '没有找到任何结果',
                        position: 'right-bottom',
                        buttonText: '模糊搜索',
                        onButtonClick: function(){
                            _on_search_btn_clicked();
                            sb.close();
                        },
                        timeout: 4000
                    });
                }
                else{
                    mdui.snackbar({
                        message: '没有找到任何结果',
                        position: 'right-bottom',
                        timeout: 3000
                    });
                }
            }
        },
        error: function (xhr, textStatus) {
            mdui.snackbar({
                message: '请求错误:' + textStatus,
                position: 'right-bottom',
                timeout: 3000
            });
        }
    });
}