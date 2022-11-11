import {
  current_req,
  setCurrent_req,
  kAryaCount,
  setKaryaCount,
  ProgressBar,
  getSelectedFiles
} from '../kry';
import { lekhaAtom, currentLocAtom } from 'state/drive';
import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { CgClose } from 'react-icons/cg';
import { toast } from 'react-toastify';
import { BiShowAlt } from 'react-icons/bi';
import { FiDownload, FiExternalLink } from 'react-icons/fi';
import { FcDownload } from 'react-icons/fc';

const _Download = (isView: boolean) => {
  const lekh = lekhaAtom.fileBar.FileView;
  const pre = useAtomValue(currentLocAtom);
  const [src, setSrc] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<[number, number]>([null!, null!]);
  const preview = async () => {
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
    const download_file = (await import('./download_file')).download_file;
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
export default _Download;
