from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
import enathu, drive

app = FastAPI(
    # r_start
    debug=True,
    # r_end
    # openapi_url=None,
    title="शुभलिपिलघूपकरणम्",
    default_response_class=PlainTextResponse,
)


@app.middleware("http")
async def middleware(req: Request, call_next):
    res: Response = await call_next(req)
    hd2 = {
        "X-Robots-Tag": "noindex",
        "X-Frame-Options": "deny",
        "X-sraShTA": "bhagavatprasAdAt",
        "Cache-Control": "No-Store",
    }
    for x in hd2:
        res.headers[x] = hd2[x]
    for x in ["X-Powered-By"]:
        if x in res.headers:
            del res.headers[x]
    return res


app.include_router(enathu.router)
app.include_router(drive.router)

app.mount("/", StaticFiles(directory="public"), name="static")

# r_start
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=3020, reload=True)
# r_end
