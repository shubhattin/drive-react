import { graphql, getCookieVal, AUTH_ID } from 'tools/drive/request';
import {
  get_URL,
  current_req,
  setCurrent_req,
  kAryaCount,
  setKaryaCount,
  ProgressBar,
  getSelectedFiles
} from './kry';
import { lekhaAtom, currentLocAtom } from 'state/drive';
import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { CgClose } from 'react-icons/cg';
import { MIME } from '../datt/mime';
import { toast } from 'react-toastify';
import { BiShowAlt } from 'react-icons/bi';
import { FiDownload, FiExternalLink } from 'react-icons/fi';
import { FcDownload } from 'react-icons/fc';

const download_file = async (
  sel: string[],
  pre: string,
  setSrc: any = null,
  setFile: any,
  setStatus: any,
  setDownloading: any
) => {
  const list = sel.map((val) => (pre === '/' ? '' : pre) + '/' + val);
  const ids = (
    await graphql(
      `
        {
          downloadID
        }
      `
    )
  )['downloadID'] as string[];
  const down_sanchit = async (i = 0) => {
    const nm = list[i];
    const nm1 = sel[list.indexOf(nm)]; // name without prefix
    setFile(nm1);
    setStatus([0.0, 0.0]);
    const TOKEN = JSON.parse(window.atob(getCookieVal(AUTH_ID)?.split('.')[1]!)).sub as string;
    const URL = get_URL(ids[0], TOKEN);
    const xhr = new XMLHttpRequest();
    setCurrent_req(xhr);
    xhr.open('GET', `${URL}/files/download?name=${nm}`, true);
    xhr.setRequestHeader('X-Api-Key', window.atob(ids[1]));
    xhr.addEventListener(
      'progress',
      (evt) => {
        if (evt.lengthComputable) {
          let total = evt.total / (1024 * 1024),
            loaded = evt.loaded / (1024 * 1024);
          setDownloading(true);
          setStatus([loaded.toFixed(2), total.toFixed(2)]);
        }
      },
      false
    );
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 2)
        if (xhr.status == 200) xhr.responseType = 'blob';
        else xhr.responseType = 'text';
    };
    xhr.onload = () => {
      const ext = nm1.split('.').pop();
      let typ = 'application/octet-stream';
      if (ext! in MIME) typ = MIME[ext! as keyof typeof MIME];
      let res = xhr.response as Blob;
      res = res.slice(0, res.size, typ);
      let url = window.URL.createObjectURL(res);
      if (!setSrc) {
        const tmp_el = document.createElement('div');
        tmp_el.innerHTML = '<a></a>';
        const elm = tmp_el.firstChild! as any;
        elm.href = url;
        elm.download = nm1;
        elm.click();
        elm.remove();
      } else setSrc(url);
      if (list.length !== ++i) down_sanchit(i);
      else {
        setDownloading(false);
        setKaryaCount(0);
      }
    };
  };
  down_sanchit();
};
export const _Download = (isView = false) => {
  const lekh = lekhaAtom.fileBar.FileView;
  const pre = useAtomValue(currentLocAtom);
  const [src, setSrc] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<[number, number]>([null!, null!]);
  const preview = () => {
    if (kAryaCount !== 0) return;
    const sel = getSelectedFiles();
    if (sel.length === 0) return;
    if (sel.length !== 1) {
      if (isView)
        toast.error(lekh.view_error, {
          position: toast.POSITION.TOP_LEFT,
          autoClose: 2500
        });
      return;
    }
    setKaryaCount(kAryaCount + 1);
    if (isView) download_file(sel, pre, setSrc, setFileName, setStatus, setDownloading);
    else download_file(sel, pre, null, setFileName, setStatus, setDownloading);
  };
  return (
    <span className="mr-2">
      {isView ? (
        <BiShowAlt
          className="text-3xl active:fill-[blue] cursor-button"
          onClick={() => preview()}
        />
      ) : (
        <FiDownload
          className="text-2xl active:text-[green] cursor-button"
          onClick={() => preview()}
        />
      )}
      {src !== '' && (
        <div className="w-11/12 h-11/12 p-1 fixed z-10 left-2 top-2 border-2 border-blue-700 rounded-lg bg-[aliceblue]">
          <div className="flex ml-4" style={{ justifyContent: 'space-between' }}>
            <span className="text-2xl">
              <a href={src} target="_blank" className="ml-2" rel="noreferrer">
                <FiExternalLink className="text-[blue] hover:text-blue-700" />
              </a>
              <a href={src} className="ml-2" download={fileName}>
                <FcDownload />
              </a>
            </span>
            <CgClose
              className="text-4xl text-red-500 cursor-button active:text-black"
              onClick={() => setSrc('')}
            />
          </div>
          <iframe src={src} className="m-1 mt-1 w-[98%] h-[80vh]"></iframe>
        </div>
      )}
      {downloading && (
        <div className="p-1 pl-1.5 fixed z-10 left-2 bottom-2 border-2 border-[red] rounded-lg bg-[aliceblue] min-w-[100px] min-h-[20px] max-w-[90%]">
          <div className="font-semibold">
            {lekh.download_msg} - <span className="text-[brown]">{fileName}</span>
          </div>
          <div className="font-semibold text-lg">
            <span>
              <span className="text-purple-600">{status[0]}</span>/
              <span className="text-violet-800">{status[1]}</span>
            </span>
            <CgClose
              onClick={() => {
                setDownloading(false);
                setKaryaCount(0);
                current_req.abort();
                setCurrent_req(null!);
              }}
              className="text-[red] text-3xl ml-5 cursor-button active:text-[brown]"
            />
          </div>
          <ProgressBar per={(status[0] / status[1]) * 100} />
        </div>
      )}
    </span>
  );
};
