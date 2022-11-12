import { refs, ProgressBar, states } from '../kry';
import { lekhaAtom, currentLocAtom, refreshFilesAtom } from 'state/drive';
import { useState, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { clsx } from 'tools/clsx';
import { GrDocumentUpload } from 'react-icons/gr';
import { CgClose } from 'react-icons/cg';
import { useAtom } from 'jotai';

export const Upload = () => {
  const lekh = lekhaAtom.fileBar.Upload;
  const [clicked, setClicked] = useAtom(states.upload.clicked);
  const pre = useAtomValue(currentLocAtom);
  const fileSelectorRef = useRef<HTMLInputElement>(null!);
  const refresh = useSetAtom(refreshFilesAtom);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<[number, number]>([null!, null!]);
  const startUpload = async () => {
    console.log();
    if (refs.kAryaCount !== 0) return;
    const files = fileSelectorRef.current.files;
    if (files?.length === 0) return;
    setClicked(false);
    refs.kAryaCount++;
    const upload_file = (await import('./upload_file')).upload_file;
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
                refs.kAryaCount = 0;
                refs.current_req.abort();
                refs.current_req = null!;
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
