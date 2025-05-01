from fastapi import APIRouter, Request
from fastapi.responses import Response, JSONResponse
from requests import get
from kry import from_base64, deta_val, render_template, deta, KEY, KEY_REG

router = APIRouter()

fl_lst = {
    "avahar.py": "saGgaNaka/contents/kAraH/avahar.py",
    "shubhlipi.py": "saGgaNaka/contents/kAraH/plugin.py",
    "c.py": "sch/contents/c.py",
}


@router.get("/api/files/list", response_class=JSONResponse)
async def get_git_file_list():
    return list(fl_lst.keys())


@router.get("/api/files/{nm:path}")
async def get_git_file(nm: str, res: Response):
    if nm in fl_lst:
        return from_base64(
            get(
                f"https://api.github.com/repos/ofsfobnelip/{fl_lst[nm]}",
                headers={
                    "Authorization": "token " + deta_val("git_key", "keys"),
                    "User-Agent": "Mozilla/5.0",
                },
            ).json()["content"]
        )
    else:
        res.status_code = 404
        return "File Not Found"


@router.post("/api/git_key")
async def get_git_key(bd: KEY, res: Response):
    if bd.key == deta_val("git"):
        return deta_val("git_key", "keys")
    else:
        res.status_code = 400
        return "Wrong Key!"


@router.post("/api/deta_auth")
@router.post("/api/deta_key")
async def get_deta_key(bd: KEY, req: Request, res: Response):
    if bd.key == deta_val("deta"):
        return deta_val(req.url.path[5:], "keys")
    else:
        res.status_code = 400
        return "Wrong Key!"


@router.post("/api/env")
async def get_set_env(bd: KEY_REG, res: Response):
    if bd.key == deta_val("env"):
        if bd.reg != None:
            deta.Base("keys").put(bd.reg, "env")
            return "Success"
        else:
            return deta_val("env", "keys")
    else:
        res.status_code = 400
        return "Wrong Key!"


def get_track_info() -> dict:
    r = get(
        "https://api.github.com/repos/ofsfobnelip/lipi/releases",
        headers={"User-Agent": "Mozilla/5.0"},
    ).json()
    d = {}
    bhsh = deta_val("display_list", "keys", True)
    for x in r:
        n = x["tag_name"]
        d[n] = {}
        if "bhasha" not in n:
            d[n]["परिगणना"] = 0
        for y in x["assets"]:
            v = y["name"].split(".")[0]
            if "bhasha" in n:
                v = bhsh[v]
            elif v == "su":
                v = "परिगणना"
            d[n][v] = y["download_count"]
    return d


@router.get("/")
async def root_GET(req: Request):
    return render_template("track.html", req)


@router.post("/api/track_info")
async def root_POST(bd: KEY, req: Request, res: Response):
    if bd.key == deta_val("track"):
        dt = get_track_info()
        if req.headers["accept"] == "application/json":
            return JSONResponse(dt)
        return render_template(
            "track1.html",
            req,
            data=dt,
            track_lst=deta_val("track_list", "keys"),
        )
    else:
        res.status_code = 403
        return "Wrong Key"
