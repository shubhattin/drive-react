import shubhlipi as sh, re, os

if sh.args(0) == "clone":
    sh.cmd("deta clone --name me")
    os.rename("me", "o")
    exit()
root = sh.env("sthAnam") + "\\jAlAnuprayogaH\\server\\me\\"
fl_kr = { # Files for Processing
    "app.py": r"main.py",
    "kry.py": r"kry.py",
    "drive.py": r"drive.py",
    "enathu.py": r"enathu.py",
}
packages = ["fastapi", "jinja2", "requests", "deta"]
o_dir = [".deta", "requirements.txt"] + list(fl_kr.values())
files = []
folders = ["public"]
repl = {
    "kry.py": {r'Deta(from_base64(os.environ["KEY"]))': r"Deta()"},
    "drive.py": {
        r'render_template("drive.html", req, prevent=False)': r'render_template("drive.html", req, prevent=True)'
    },
    "app.py": {
        r'"Cache-Control": "No-Store"': r'"Cache-Control": "public, max-age=600"',
        r"# openapi_url=None,": r"openapi_url=None,",
    },
}
for lc in fl_kr:
    f = sh.read(root + lc)
    rpl = {}
    if lc in repl:
        rpl.update(repl[lc])
    for x in rpl:
        f = f.replace(x, rpl[x])
    f = sh.remove_in_between(f)
    # f = sh.remove_line_with_tag(f, "drive")
    f = re.sub(r"\n\s*\n", "\n", f)
    sh.write(f"{root}o\\{fl_kr[lc]}", f)
sh.write("o/requirements.txt", "\n".join(packages))
for x in os.listdir("o"):
    if x in o_dir:
        continue
    if os.path.isfile("o/" + x):
        sh.delete_file("o/" + x)
    else:
        sh.delete_folder("o/" + x)
for x in files:
    sh.copy_file(x, "o/" + x)
for x in folders:
    sh.copy_folder(x, "o/" + x)
tp = {
    "json": sh.minify_json,
    "js": sh.minify_js,
    "css": sh.minify_css,
    "html": sh.minify_html,
}
th = []
tm = sh.time()
for y in ["o/public/fl"]:
    for x in os.listdir(y):
        t = x.split(".")
        if len(t) == 1:
            continue
        t = t[-1]
        if t in tp:
            th.append(
                sh.start_thread(
                    lambda: sh.write(y + "/" + x, tp[t](sh.read(y + "/" + x)))
                )
            )
for x in th:
    x.join()
print(200, sh.time() - tm)
if sh.args(0) == "deploy":
    sh.cmd("cd o\ndeta deploy", file=True)
