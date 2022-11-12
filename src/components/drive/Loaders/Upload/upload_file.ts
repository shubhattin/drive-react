import { graphql, getCookieVal, AUTH_ID } from 'tools/drive/request';
import { get_URL, refs } from '../kry';
import { fetch_post, Fetch } from 'tools/fetch';

export const upload_file = async (
  files: FileList,
  prefix: string,
  refresh: any,
  setFile: any,
  setStatus: any,
  setUploading: any
) => {
  if (prefix === '/') prefix = '';
  const ids = (
    await graphql(
      `
        {
          uploadID
        }
      `
    )
  )['uploadID'] as string[];
  const upld = async (i = 0) => {
    const file = files[i];
    const AkAra = file.size / (1024 * 1024);
    setFile(file.name);
    setStatus([0.0, AkAra.toFixed(2)]);
    setUploading(true);
    const MAX_CHUNK_SIZE = 9.985 * 1024 * 1024;
    const TOKEN = JSON.parse(window.atob(getCookieVal(AUTH_ID)?.split('.')[1]!)).sub as string;
    const URL = get_URL(ids[0], TOKEN);
    const UPLOAD_ID = (
      await (
        await fetch_post(`${URL}/uploads`, {
          params: {
            name: `${prefix}/${file.name}`
          },
          headers: { 'X-Api-Key': window.atob(ids[1]) }
        })
      ).json()
    ).upload_id as string;
    let loaded = 0,
      count = 0;
    const reader = new FileReader();
    let blob = file.slice(loaded, MAX_CHUNK_SIZE);
    reader.readAsArrayBuffer(blob);
    reader.onload = () => {
      const xhr = new XMLHttpRequest();
      refs.current_req = xhr;
      xhr.open(
        'POST',
        `${URL}/uploads/${UPLOAD_ID}/parts?part=${++count}&name=${prefix}/${file.name}`,
        true
      );
      xhr.setRequestHeader('X-Api-Key', window.atob(ids[1]));
      xhr.upload.addEventListener(
        'progress',
        function (evt) {
          if (evt.lengthComputable) {
            let loaded1 = (evt.loaded + MAX_CHUNK_SIZE * (count - 1)) / (1024 * 1024);
            setStatus([loaded1.toFixed(2), AkAra.toFixed(2)]);
          }
        },
        false
      );
      xhr.send(reader.result);
      xhr.onload = async () => {
        loaded += MAX_CHUNK_SIZE;
        if (loaded < file.size) {
          blob = file.slice(loaded, loaded + MAX_CHUNK_SIZE);
          reader.readAsArrayBuffer(blob);
        } else {
          const req = await Fetch(`${URL}/uploads/${UPLOAD_ID}`, {
            params: {
              name: `${prefix}/${file.name}`
            },
            method: 'PATCH',
            headers: { 'X-Api-Key': window.atob(ids[1]) }
          });
          if (req.status === 200) {
            setUploading(false);
            refresh([[`${prefix}/${file.name}`], 'add']);
            if (files.length !== ++i) upld(i);
            else refs.kAryaCount = 0;
          }
        }
      };
    };
  };
  upld();
};
