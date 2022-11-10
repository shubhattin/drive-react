import { graphql, getCookieVal, AUTH_ID } from 'tools/drive/request';
import {
  get_URL,
  current_req,
  setCurrent_req,
  kAryaCount,
  setKaryaCount,
  ProgressBar
} from './kry';
import { fetch_post, Fetch } from 'tools/fetch';
import { lekhaAtom, currentLocAtom, refreshFilesAtom } from 'state/drive';
import { useState, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { clsx } from 'tools/clsx';
import { GrDocumentUpload } from 'react-icons/gr';
import { CgClose } from 'react-icons/cg';

const upload_file = async (
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
      setCurrent_req(xhr);
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
            else setKaryaCount(0);
          }
        }
      };
    };
  };
  upld();
};

export const Upload = () => {
  const lekh = lekhaAtom.fileBar.Upload;
  const [clicked, setClicked] = useState(true);
  const pre = useAtomValue(currentLocAtom);
  const fileSelectorRef = useRef<HTMLInputElement>(null!);
  const refresh = useSetAtom(refreshFilesAtom);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<[number, number]>([null!, null!]);
  const startUpload = () => {
    if (kAryaCount !== 0) return;
    const files = fileSelectorRef.current.files;
    if (files?.length === 0) return;
    setClicked(false);
    setKaryaCount(kAryaCount + 1);
    upload_file(files!, pre, refresh, setFileName, setStatus, setUploading);
  };
  return (
    <>
      {clicked && (
        <div className="p-1 fixed z-10 left-2 top-4 border-2 border-blue-700 rounded-lg bg-[aliceblue]">
          <div>
            <input
              type="file"
              ref={fileSelectorRef}
              multiple
              className={clsx(
                'file:mr-1 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-md file:font-semibold  file:text-white',
                'file:bg-gradient-to-r file:from-blue-600 file:to-amber-600',
                'hover:file:cursor-pointer hover:file:opacity-80 text-xs text-grey-500'
              )}
            />
            <GrDocumentUpload className="text-2xl cursor-button" onClick={() => startUpload()} />
          </div>
          <button
            onClick={() => setClicked(false)}
            className="rounded-lg border-green-600 border-2 px-1 mr-2 mt-1.5 py-[2px] active:border-black active:text-[green]"
          >
            {lekh.yes}
          </button>
        </div>
      )}
      {uploading && (
        <div className="p-1 pl-1.5 fixed z-10 left-2 bottom-2 border-2 border-[red] rounded-lg bg-[aliceblue] min-w-[100px] min-h-[20px] max-w-[90%]">
          <div className="font-semibold">
            {lekh.upload_msg} - <span className="text-[brown]">{fileName}</span>
          </div>
          <div className="font-semibold text-lg">
            <span>
              <span className="text-purple-600">{status[0]}</span>/
              <span className="text-violet-800">{status[1]}</span>
            </span>
            <CgClose
              onClick={() => {
                setUploading(false);
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
    </>
  );
};

export default Upload;
