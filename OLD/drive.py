from fastapi import APIRouter, Request
from fastapi.responses import Response, JSONResponse
from kry import (
    deta,
    render_template,
    KEY_NEW,
    KEY_PASS,
    deta_val,
    to_base64,
    KEY_OLD,
    KEY_PASS_NAME,
)

router = APIRouter()
drive_keys = {}


@router.get("/drive")
async def drive_root(req: Request):
    return render_template("drive.html", req, prevent=False)


def check_browser(hd: dict):
    c = True
    c = "Origin" in hd and "User-Agent" in hd
    if c:
        c = hd["Origin"] in ["http://localhost:3020", "https://shubhlipi.deta.dev"]
    return c


@router.post("/api/drive/auth")
async def drive_auth(bd: KEY_PASS, req: Request, res: Response):
    if not check_browser(req.headers):
        res.status_code = 403
        return "Wrong Key!"
    l = deta_val(bd.id, "drive_users")
    if l == None:
        res.status_code = 404
        return "User Not Found"
    elif bd.key == l:
        global drive_keys
        drive_keys[bd.id] = bd.key
        return deta_val("drive_id", "keys")
    else:
        res.status_code = 400
        return "Wrong Key!"


@router.post("/api/drive/list", response_class=JSONResponse)
async def drive_list(bd: KEY_PASS, req: Request, res: Response):
    if not check_browser(req.headers):
        res.status_code = 403
        return ["Wrong Key!"]
    global drive_keys
    if bd.id not in drive_keys and deta_val(bd.id, "drive_users") == bd.key:
        drive_keys[bd.id] = bd.key
    if bd.id in drive_keys and bd.key == drive_keys[bd.id]:
        return deta.Drive(bd.id).list()["names"]
    res.status_code = 403
    return ["Wrong Key!"]


@router.post("/api/drive/download")
@router.post("/api/drive/upload")
async def drive_down_up(bd: KEY_PASS, req: Request, res: Response):
    if not check_browser(req.headers):
        res.status_code = 403
        return "Wrong Key!"
    global drive_keys
    if bd.id not in drive_keys and deta_val(bd.id, "drive_users") == bd.key:
        drive_keys[bd.id] = bd.key
    if bd.id in drive_keys and bd.key == drive_keys[bd.id]:
        return to_base64(deta_val("deta_key", "keys"))
    res.status_code = 403
    return "Wrong Key!"


@router.delete("/api/drive/delete")
async def drive_del(bd: KEY_PASS_NAME, req: Request, res: Response):
    if not check_browser(req.headers):
        res.status_code = 403
        return "Wrong Key!"
    global drive_keys
    if bd.id not in drive_keys and deta_val(bd.id, "drive_users") == bd.key:
        drive_keys[bd.id] = bd.key
    if bd.id in drive_keys and bd.key == drive_keys[bd.id]:
        deta.Drive(bd.id).delete(bd.name)
        return "Deleted " + bd.name
    res.status_code = 403
    return "Wrong Key!"


@router.patch("/api/drive/reset")
async def drive_reset(bd: KEY_OLD, req: Request, res: Response):
    if not check_browser(req.headers):
        res.status_code = 403
        return "Wrong Key!"
    l = deta_val(bd.id, "drive_users")
    if l == None:
        res.status_code = 404
        return "User Not Found"
    elif bd.old == l and (bd.new != "" and bd.id != ""):
        if len(bd.new) < 8:
            res.status_code = 403
            return "Password must contain 8 characters"
        deta.Base("drive_users").put(bd.new, bd.id)
        return "Successfully changed password of " + bd.id
    else:
        res.status_code = 403
        return "Wrong Key! Reset Fail"


@router.post("/api/drive/add")
async def drive_add_user(bd: KEY_NEW, req: Request, res: Response):
    if not check_browser(req.headers):
        res.status_code = 403
        return "Wrong Key!"
    l = deta_val(bd.id, "drive_users")
    if l != None:
        res.status_code = 404
        return "User Already Exists"
    elif bd.main_key == deta_val("drive_auth") and (bd.key != "" and bd.id != ""):
        if len(bd.key) < 8:
            res.status_code = 403
            return "Password must contain 8 characters"
        deta.Base("drive_users").put(bd.key, bd.id)
        return "Successfully created Drive for " + bd.id
    else:
        res.status_code = 403
        return "Wrong Key! Not able to register user"
