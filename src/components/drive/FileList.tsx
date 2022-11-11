import { filesAtom, currentLocAtom, listElement, lekhaAtom } from 'state/drive';
import { useAtom } from 'jotai';
import { val_from_adress } from 'tools/json';
import fileImageList, { fileImg } from './datt/fileType';
import { FcOpenedFolder } from 'react-icons/fc';
import ImageSpan from 'components/ImageSpan';
import { useEffect, useRef } from 'react';

const FileList = () => {
  const lekh = lekhaAtom.fileList;
  const [files, setFiles] = useAtom(filesAtom);
  const [pre, setPre] = useAtom(currentLocAtom);
  const currentDir = val_from_adress(pre, files);
  const list = Object.keys(currentDir);
  const folderList = list.filter((key) => typeof currentDir[key] === 'object');
  const fileList = list.filter((key) => currentDir[key] === -1);
  const folderOpen = (path: string) => {
    setPre(pre + (pre !== '/' ? '/' : '') + path);
  };
  const cn = useRef(0); // render count of Object
  cn.current++;
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (cn.current !== 1) {
        setPre('/');
        setFiles({});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      ref={listElement}
      className="bg-[#fbfffb] inline-block mt-3 mx-1 mb-32 p-1.5 border-2 border-amber-800 min-w-[300px] min-h-[250px] rounded-md "
    >
      {folderList.map((key) => (
        <label
          key={key}
          className="text-[purple] font-semibold hover:text-black"
          onClick={() => folderOpen(key)}
        >
          <input type="checkbox" className="mr-1 w-0 h-0 absolute" disabled />
          <div className="flex mb-1 p-[2px] whitespace-pre-wrap active:text-orange-600 transition">
            <FcOpenedFolder className="text-2xl mr-1.5" />
            {key}
          </div>
        </label>
      ))}
      {fileList.map((key) => {
        const ext = key.split('.').pop();
        const src =
          ext! in fileImageList
            ? fileImageList[ext! as keyof typeof fileImageList].src
            : fileImg.src;
        return (
          <label key={key} className="text-[#00f] font-semibold hover:text-black">
            <input type="checkbox" className="mr-1 w-0 h-0 absolute peer invisible" value={key} />
            <div className="flex mb-1 p-[2px] rounded-sm whitespace-pre-wrap active:text-rose-600 peer-checked:bg-[#f2ff82] hover:bg-zinc-100 transition">
              <ImageSpan className="w-5 h-5 mr-1.5 mt-1" src={src} />
              {key}
            </div>
          </label>
        );
      })}
      {cn.current !== 1 && list.length === 0 && <div>{lekh.no_file}</div>}
    </div>
  );
};
export default FileList;
