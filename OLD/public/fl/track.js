$l("#key").on("keydown", function(ev) {
    if (13 == (ev.keyCode || ev.which))
        $lf.post("/api/track_info", {
            json: {
                key: $l("#key").val()
            },
            success: (r) => {
                $l("body").html(r);
                $l("#lpi").on("change", function () {
                    $l($l("#su").children()).hide();
                    $l(`#su [typ=${this.value}]`).show();
                });
                $l("#lpi").trigger("change");
            },
            error: () => {
                let e = $l("#key");
                e.css("border-color", "red");
                e.val("");
                setTimeout(() => e.css("border-color", ""), 750);
            }
        });
});