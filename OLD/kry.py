from deta import Deta
import base64, json
from pydantic import BaseModel
from fastapi.templating import Jinja2Templates

pages = Jinja2Templates(directory="public/tmp")


def render_template(nm: str, req, **r):
    r["request"] = req
    return pages.TemplateResponse(nm, r)


def from_base64(v):
    return base64.b64decode(v).decode("utf-8")


def to_base64(v):
    return base64.b64encode(bytes(v, "utf-8")).decode("utf-8")


# r_start
from dotenv import load_dotenv
import os

load_dotenv()
# r_end
deta = Deta(from_base64(os.environ["KEY"]))


def get_type(fg):
    return str(type(fg))[8:-2]


def deta_val(ky, rt="verify", jsn=False):
    if ky == "":
        return None
    v = deta.Base(rt).get(ky)
    tp = get_type(v)
    if tp == "NoneType":
        v = None
    else:
        v = v["value"]
    if jsn:
        v = json.loads(v)
    return v


class KEY(BaseModel):
    key: str


class KEY_REG(KEY):
    reg: str = None


class KEY_PASS(KEY):
    id: str


class KEY_PASS_NAME(KEY_PASS):
    name: str


class KEY_OLD(BaseModel):
    old: str
    new: str
    id: str


class KEY_NEW(KEY):
    main_key: str
    id: str
