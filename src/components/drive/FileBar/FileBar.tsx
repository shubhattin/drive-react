import { graphql, deleteAuthCookies } from 'tools/drive/request';
import { set_val_from_adress, copyJSON } from 'tools/json';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { filesAtom, currentLocAtom, listElement, refreshFilesAtom, lekhaAtom } from 'state/drive';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { GrLogout } from 'react-icons/gr';
import { BsFolderPlus } from 'react-icons/bs';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Download, FileView, getSelectedFiles, SEARCH_STR } from './Loaders';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { FiUpload } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const Upload = dynamic(() => import('./Upload'), { ssr: false });

const FileBar = () => {
  return (
    <div className="flex">
      <Selector />
      <Reload />
      <Download />
      <Delete />
      <NewFolder />
      <_Upload />
      <FileView />
      <Logout />
    </div>
  );
};
export default FileBar;

const _Upload = () => {
  const [clicked, setClicked] = useState(false);
  return (
    <span className="mr-2">
      <FiUpload
        className="text-2xl active:text-[green] cursor-button"
        onClick={() => setClicked(true)}
      />
      {clicked && <Upload />}
    </span>
  );
};

const Selector = () => {
  const checked = useRef(false);
  const elRef = useRef<HTMLInputElement>(null!);
  const pre = useAtomValue(currentLocAtom);
  const fn = () => {
    checked.current = !checked.current;
    const el = listElement.current.querySelectorAll<HTMLInputElement>(SEARCH_STR);
    for (let x of el) x.checked = checked.current;
  };
  useEffect(() => {
    elRef.current.checked = false;
    checked.current = false;
  }, [pre]);
  return (
    <span className="mr-2 cursor-default">
      <input type="checkbox" onClick={() => fn()} ref={elRef} />
    </span>
  );
};

const Reload = () => {
  const lekh = lekhaAtom.fileBar.Reload;
  const [fileList, setFileList] = useAtom(filesAtom);
  const [refrsh, setRefresh] = useAtom(refreshFilesAtom);
  const reload = async () => {
    const list = (
      await graphql(
        `
          {
            fileList
          }
        `
      )
    ).fileList as string[];
    let json: any = {};
    for (let x of list) set_val_from_adress(`/${x}`, json, -1, true);
    setFileList(json);
  };
  useEffect(() => {
    reload();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!refrsh[0]) return;
    if (refrsh[1] === 'add')
      for (let x of refrsh[0]) {
        set_val_from_adress(x, fileList, -1);
        toast.success(`${x.split('/')[x.split('/').length - 1]} ${lekh.added_msg}`, {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 3800
        });
      }
    else if (refrsh[1] === 'delete')
      for (let x of refrsh[0]) {
        set_val_from_adress(x, fileList, -2);
        toast.info(`${x.split('/')[x.split('/').length - 1]} ${lekh.deleted_msg}`, {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 3000
        });
      }
    setFileList(copyJSON(fileList));
    setRefresh([null!, null!]);
  }, [refrsh]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span className="mr-2">
      <AiOutlineReload
        className="text-2xl cursor-button active:bg-gray-100 rounded-xl active:fill-[blue]"
        onClick={() => reload()}
      />
    </span>
  );
};

const NewFolder = () => {
  const lekh = lekhaAtom.fileBar.NewFolder;
  const [clicked, setClicked] = useState(false);
  const [files, setFiles] = useAtom(filesAtom);
  const [pre] = useAtom(currentLocAtom);
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null!);
  const addFolder = () => {
    if (val === '') return;
    const loc = pre + (pre !== '/' ? '/' : '') + val;
    let json = copyJSON(files);
    set_val_from_adress(loc, json, {});
    setVal('');
    setClicked(false);
    setFiles(json);
  };
  useEffect(() => {
    if (clicked) inputRef.current.focus();
  }, [clicked]);
  return (
    <span className="mr-2">
      <BsFolderPlus
        className="text-2xl cursor-button active:fill-green-600"
        onClick={() => setClicked(true)}
      />
      {clicked && (
        <div className="p-1 fixed z-10 left-2 top-4 border-2 border-blue-700 rounded-lg bg-[aliceblue]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addFolder();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="px-1 mb-2 border border-black rounded"
              placeholder={lekh.file_input}
              value={val}
              onChange={({ target: { value } }) => setVal(value)}
            />
          </form>
          <button
            onClick={() => addFolder()}
            className="rounded-lg border-green-600 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[green]"
          >
            {lekh.add_file_msg}
          </button>
          <button
            onClick={() => setClicked(false)}
            className="rounded-lg border-rose-500 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[red]"
          >
            {lekh.no}
          </button>
        </div>
      )}
    </span>
  );
};

const Delete = () => {
  const lekh = lekhaAtom.fileBar.Delete;
  const refresh = useSetAtom(refreshFilesAtom);
  const pre = useAtomValue(currentLocAtom);
  const delete_files = async () => {
    const selected = getSelectedFiles().map((val) => (pre === '/' ? '' : pre) + '/' + val);
    if (selected.length === 0) return;
    setClicked(false);
    const res = await graphql(
      `
        query ($files: [String!]!) {
          deleteFiles(files: $files) {
            deleted
            failed
          }
        }
      `,
      { files: selected }
    );
    refresh([selected, 'delete']);
  };
  const [clicked, setClicked] = useState(false);
  return (
    <span className="mr-2">
      <RiDeleteBin6Line
        className="text-2xl cursor-button active:fill-[red]"
        onClick={() => getSelectedFiles().length !== 0 && setClicked(true)}
      />
      {clicked && (
        <div className="p-1 fixed z-10 left-2 top-4 border-2 border-blue-700 rounded-lg bg-[aliceblue]">
          <div>{lekh.confirm_msg}</div>
          <button
            onClick={() => delete_files()}
            className="rounded-lg border-green-600 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[green]"
          >
            {lekh.yes}
          </button>
          <button
            onClick={() => setClicked(false)}
            className="rounded-lg border-rose-500 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[red]"
          >
            {lekh.no}
          </button>
        </div>
      )}
    </span>
  );
};

const Logout = () => {
  const lekh = lekhaAtom.fileBar.Logout;
  const router = useRouter();
  const logout = () => {
    deleteAuthCookies();
    router.push('/drive/login');
  };
  const [clicked, setClicked] = useState(false);
  return (
    <span className="ml-6">
      <GrLogout
        className="text-2xl cursor-button active:fill-red-600"
        onClick={() => setClicked(true)}
      />
      {clicked && (
        <div className="p-1 fixed z-10 left-2 top-4 border-2 border-blue-700 rounded-lg bg-[aliceblue]">
          <div>{lekh.confirm_msg}</div>
          <button
            onClick={() => logout()}
            className="rounded-lg border-green-600 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[green]"
          >
            {lekh.yes}
          </button>
          <button
            onClick={() => setClicked(false)}
            className="rounded-lg border-rose-500 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[red]"
          >
            {lekh.no}
          </button>
        </div>
      )}
    </span>
  );
};
