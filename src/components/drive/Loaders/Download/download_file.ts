import { graphql, getCookieVal, AUTH_ID } from 'tools/drive/request';
import { get_URL, setCurrent_req, setKaryaCount } from '../kry';
import { MIME } from '@drive/datt/mime';

export const download_file = async (
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
