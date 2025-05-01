class अनुप्रयोगः {
    constructor() {
        this.url = "";
        this.current_req = null;
        this.types = {};
        this.root = "";
        this.select = false;
        this.pre = "";
        this.json = "";
    }
    async start(id) {
        app.root = id;
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = () => {
            window.history.pushState(null, "", window.location.href);
            app.back()
        };
        app.init();
        app.types = await $lf.get("/fl/mime.json");
    }
    init() {
        $l(".init").hide();
        $l("#ok").show();
        let vl = $l("#id").val();
        app.url = `https://drive.deta.sh/v1/${app.root}/${vl}`;
        $lf.post(`/api/drive/list`, {
            json: {
                id: $l("#id").val(),
                key: $l("#key").val()
            },
            success: (r) => {
                app.json = {};
                for (let x of r)
                    $lf.set_val_from_adress(`/${x}`, app.json, -1, true)
                app.update_list(app.pre);
            }
        });
    }
    update_list(pre) {
        app.pre = pre;
        if (pre == "")
            pre += "/";
        app.select = false;
        $l("#sel_all").check(false);
        $l(".pre").text(pre)
        let ht = ["", ""];
        try {
            let lst = $lf.val_from_adress(pre, app.json);
            for (let x in lst) {
                let folder = typeof ($lf.val_from_adress(app.pre + "/" + x, app.json)) == "object"
                if (folder)
                    ht[0] += `<label class="list flex folder_col"><input style="display:none;" type="checkbox" disabled name="files" value="${x}"/><span class="folder_img"></span>${x}</label>`
                else {
                    let ext = x.split(".").pop();
                    let tp = "file";
                    let img_list = {
                        chala: "video",
                        mkv: "video",
                        mp4: "video",
                        shr: "music",
                        mp3: "music",
                        m4a: "music",
                        wav: "music",
                        aac: "music",
                        jpg: "photo",
                        jpeg: "photo",
                        svg: "photo",
                        gif: "photo",
                        ico: "photo",
                        png: "photo",
                        pdf: "pdf",
                        doc: "word",
                        docx: "word",
                        ppt: "power",
                        pptx: "power",
                        xlsx: "excel",
                        xls: "excel"
                    }
                    if (ext in img_list)
                        tp = img_list[ext];
                    ht[1] += `<label class="list flex file_col"><input style="display:none;" type="checkbox" name="files" value="${x}"/><div class="flex"><span class="file_img in-block" style="background-image:url(/img/typ/${tp}.svg);"></span>${x}</div></label>`
                }
            }
        } catch { }
        if (ht[0].length == 0 && ht[1].length == 0)
            ht[0] = "Folder is empty";
        $l("#list").html(ht[0] + ht[1]);
    }
    back() {
        let lc = $l(".pre").text();
        if (lc == "/")
            return;
        lc = lc.substring(1).split("/");
        lc.pop();
        lc = "/" + lc.join("/")
        if (lc == "/")
            lc = "";
        app.update_list(lc)
    }
    add_folder(r) {
        let el = $l("#create_val");
        if (el.val() == "")
            return;
        let pre = app.pre,
            vl = el.val();
        if (pre == "")
            pre = "/";
        else
            pre += "/"
        pre += vl
        el.val("");
        $lf.set_val_from_adress(pre, app.json, {})
        $l(".create_msg").hide();
        app.update_list(pre)
    }
    change_dir(ev) {
        if (ev.path.indexOf($l("#list")[0]) != 1)
            return;
        let elm = $l(ev.path[0]);
        if (elm.find("input").attr("disabled") != "")
            return;
        app.update_list(app.pre + "/" + elm.text())
    }
    get_sel() {
        let lst = [];
        for (let x of $l("input[type=checkbox][name=files]:checked").elm)
            lst.push(x.value);
        return lst;
    }
    async download_files(prv = null, fn = null) {
        if (window.openHTTPs != 0)
            return;
        let lst = app.get_sel();
        let prfx = app.pre;
        let elm = $l(".down_help")[0];
        let down_id = {
            "X-Api-Key": atob(await $lf.post("/api/drive/download", {
                json: {
                    id: $l("#id").val(),
                    key: $l("#key").val()
                },
            }))
        }
        if (lst.length >= 1)
            down_sanchit(lst[0])
        function down_sanchit(nm) {
            app.current_req = $lf.get(`${app.url}/files/download?name=${prfx}/${nm}`, {
                headers: down_id,
                xhr: function () {
                    var xhr = new XMLHttpRequest();
                    $l("#track").show();
                    add_msg(`Downloading ${nm}`, "brown");
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 2)
                            if (xhr.status == 200)
                                xhr.responseType = "blob";
                            else
                                xhr.responseType = "text";
                    };
                    xhr.addEventListener("progress", app.track_progress, false);
                    return xhr;
                },
                success: (r) => {
                    var f = nm.split("/");
                    f = f[f.length - 1];
                    let ex = f.split(".");
                    let tp = "application/octet-stream";
                    if (ex.length > 1) {
                        ex = ex[ex.length - 1]
                        if (ex in app.types)
                            tp = app.types[ex]
                    }
                    r = r.slice(0, r.size, tp)
                    add_msg(`Downloaded ${f}`, "green")
                    let url = window.URL.createObjectURL(r);
                    if (prv == null) {
                        elm.href = url;
                        elm.download = f;
                        elm.click();
                        window.URL.revokeObjectURL(url);
                    } else {
                        prv.src = url;
                        try {
                            prv.load()
                        } catch { }
                        if (fn != null)
                            fn()
                    }
                    app.reset();
                    lst.shift()
                    if (lst.length >= 1)
                        down_sanchit(lst[0])
                }
            });

        }
    }
    track_progress(evt) {
        if (evt.lengthComputable) {
            let total = evt.total / (1024 * 1024),
                loaded = evt.loaded / (1024 * 1024);
            let per = loaded / total * 100;
            $l("#progress div").css("width", `${per}%`)
            $l("#track #size").html(`${loaded.toFixed(2)} / ${total.toFixed(2)} mb`)
        }
    }
    dl_file() {
        if (window.openHTTPs != 0)
            return;
        let lst = app.get_sel();
        let prfx = app.pre;
        $l(".del_msg").hide()
        if (lst.length >= 1)
            del_sanchit(lst[0])

        function del_sanchit(nm) {
            $lf.ajax(`/api/drive/delete`, {
                type: "DELETE",
                json: {
                    id: $l("#id").val(),
                    key: $l("#key").val(),
                    name: prfx + "/" + nm
                },
                success: () => {
                    add_msg(`Deleted ${nm}`, "red");
                    lst.shift()
                    if (lst.length >= 1)
                        del_sanchit(lst[0])
                    else if (lst.length == 0)
                        app.init();
                }
            })

        }
    }
    reset() {
        $l("#track").hide();
        $l("#progress div").css("width", "");
        $l("#track #size").html("")
    }
    async upload_file() {
        if (window.openHTTPs != 0)
            return;
        let prfx = app.pre;
        let upld_id = {
            "X-Api-Key": atob(await $lf.post("/api/drive/upload", {
                json: {
                    id: $l("#id").val(),
                    key: $l("#key").val()
                },
            }))
        }
        async function upld(i = 0) {
            let fl = $l("#file")[0].files;
            if (fl.length == 0)
                return;
            else
                $l(".up_msg").hide();
            let file = fl[i];
            let AkAra = file.size / (1024 * 1024);
            let max_chunk_size = 9.985 * 1024 * 1024;
            let id = (await $lf.post(`${app.url}/uploads?name=${prfx}/${file.name}`, {
                headers: upld_id
            }))["upload_id"];
            var loaded = 0,
                count = 0;
            var reader = new FileReader();
            var blob = file.slice(loaded, max_chunk_size);
            reader.readAsArrayBuffer(blob);
            $l("#track").show();
            add_msg(`Uploading ${file.name}`, "brown");
            reader.onload = function (e) {
                app.current_req = $lf.post(`${app.url}/uploads/${id}/parts?part=${++count}&name=${prfx}/${file.name}`, {
                    data: reader.result,
                    headers: upld_id,
                    xhr: function () {
                        var xhr = new XMLHttpRequest();
                        $l("#track").show();
                        xhr.upload.addEventListener("progress", function (evt) {
                            if (evt.lengthComputable) {
                                let loaded1 = (evt.loaded + max_chunk_size * (count - 1)) / (1024 * 1024);
                                let per = loaded1 / AkAra * 100;
                                $l("#progress div").css("width", `${per}%`)
                                $l("#track #size").html(`${loaded1.toFixed(2)} / ${AkAra.toFixed(2)} mb`)
                            }
                        }, false);
                        return xhr;
                    },
                    success: () => {
                        loaded += max_chunk_size;
                        if (loaded < file.size) {
                            blob = file.slice(loaded, loaded + max_chunk_size);
                            reader.readAsArrayBuffer(blob);
                        } else
                            $lf.ajax(`${app.url}/uploads/${id}?name=${prfx}/${file.name}`, {
                                type: "PATCH",
                                headers: upld_id,
                                success: () => {
                                    app.init()
                                    add_msg(`Uploaded ${file.name}`, "green")
                                    app.reset()
                                    if (fl.length != ++i)
                                        upld(i);
                                }
                            })
                    }
                })
            };
        }
        upld();
    }
    select_all() {
        app.select = !app.select
        for (let x of $l(".file_col input[type=checkbox]").elm)
            $l(x).check(app.select);
    }
    preview() {
        if (window.openHTTPs != 0)
            return;
        let sl = app.get_sel();
        if (sl.length == 0)
            return;
        if (sl.length != 1) {
            add_msg("Select only 1 file to preview", "brown")
            return;
        }
        let fl = sl[0];
        app.download_files(
            $l(".preview_win div.prv").html(`<iframe></iframe>`).children()[0],
            () => {
                $l(".preview_win a")[0].href = $l(".preview_win div.prv").children()[0].src
                $l(".preview_win a")[0].down = fl;
                $l(".preview_win").css({
                    width: "95%",
                    height: "95%"
                })
                $l(".preview_win div.prv iframe").css({
                    height: "80vh"
                })
            }
        );
        $l(".preview_win").show()
    }
}
var app = new अनुप्रयोगः();
$l("#id").on("keydown", function (ev) {
    if (13 == (ev.keyCode || ev.which))
        $l("#key").focus();
});
$l("#key").on("keydown", function (ev) {
    if (13 == (ev.keyCode || ev.which))
        $l("#login").trigger("click")
});
$l("#login").on("click", () => {
    $lf.post("/api/drive/auth", {
        json: {
            id: $l("#id").val(),
            key: $l("#key").val()
        },
        success: app.start,
        error: () => {
            $l("#id").focus();
            let e = $l(".key");
            e.css("border-color", "red");
            e.val("");
            setTimeout(() => e.css("border-color", ""), 750);
        }
    });
})
$l("#close_prv").on("click", () => {
    $l(".preview_win div.prv").html("")
    $l(".preview_win").hide()
    $l(".preview_win").css({
        width: "",
        height: ""
    })
})
$l("#down_btn").on("click", () => app.download_files())
$l("#list").on("click", app.change_dir)
$l("#upload").on("click", app.upload_file)
$l("#msg").on("click", function () {
    $l(this).hide()
});
$l("#sel_all").on("click", () => {
    app.select_all()
})
$l("input").attr({
    "autocapitalize": "none",
    "spellcheck": "false"
})
$l(".back_btn").on("click", app.back)
$l(".preview_btn").on("click", app.preview)
$l("#direct_down").on("click", () => {
    $l(".preview_win a")[0].download = $l(".preview_win a")[0].down;
    $l(".preview_win a")[0].click();
    $l(".preview_win a").removeAttr("download")
})
function add_msg(txt, cl = "purple") {
    $l("#msg").html(txt);
    $l("#msg").css("color", cl)
    $l("#msg").show();
}
$l("#reload").on("click", app.init)
$l("#abort").on("click", () => {
    app.current_req.xhr.abort();
    app.reset();
    add_msg("Current Request cancelled", "red")
})
$l("#del_btn").on("click", () => {
    if (app.get_sel() != 0)
        $l(".del_msg").show()
})
$l(".create_btn").on("click", () => {
    $l(".create_msg").show()
    $l("#create_val").focus()
})
$l(".logout_btn").on("click", () => $l(".logout_msg").show())
$l("#logout_yes").on("click", () => {
    $l(".init").show()
    $l("#ok, .logout_msg").hide()
    $l("#id, #key").val("")
    $l("#list, .pre").html("")
    app.pre = "";
    app.json = "";
})
$l(".up_btn").on("click", () => $l(".up_msg").show())
$l("#del_yes").on("click", app.dl_file)
$l("#create_yes").on("click", app.add_folder)
$l("#rst_win").on("click", () => {
    $l(".init").hide();
    $l(".reset, #id").show()
})
$l("#mng_win").on("click", () => {
    $l(".init").hide();
    $l(".key").show();
    $l(".reset").hide()
    $l(".manage").show()
})
$l("#rst_btn").on("click", () => {
    $l(".reset .msg").html("")
    $lf.ajax("/api/drive/reset", {
        type: "PATCH",
        json: {
            id: $l("#id").val(),
            old: $l("#rst_old").val(),
            new: $l("#rst_new").val(),
        },
        success: (r) => $l(".reset .msg").html(r).css("color", "green"),
        error: (r) => $l(".reset .msg").html(r).css("color", "red")
    })
})
$l("#mng_btn").on("click", () => {
    $l(".manage .msg").html("")
    $lf.post("/api/drive/add", {
        json: {
            main_key: $l("#mng_id").val(),
            id: $l("#id").val(),
            key: $l("#key").val()
        },
        success: (r) => $l(".manage .msg").html(r).css("color", "green"),
        error: (r) => $l(".manage .msg").html(r).css("color", "red")
    })
});
(function () {
    var oldOpen = XMLHttpRequest.prototype.open;
    window.openHTTPs = 0;
    XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
        window.openHTTPs++;
        this.addEventListener("readystatechange", function () {
            if (this.readyState == 4) {
                window.openHTTPs--;
            }
        }, false);
        oldOpen.call(this, method, url, async, user, pass);
    }
})();
window.onbeforeunload = () => "Do you really want to Leave";