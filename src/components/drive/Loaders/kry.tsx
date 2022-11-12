import { atom } from 'jotai';
import { listElement } from 'state/drive';

export const SEARCH_STR = 'label>input[type=checkbox]';

export const states = {
  upload: {
    clicked: atom(false)
  }
};

export const refs: { current_req: XMLHttpRequest; kAryaCount: number } = {
  kAryaCount: 0,
  current_req: null!
};

export const getSelectedFiles = () => {
  let list: string[] = [];
  for (let x of listElement.current.querySelectorAll<HTMLInputElement>(`${SEARCH_STR}:checked`))
    list.push(x.value);
  return list;
};

export const get_URL = (id: string, user: string) => `https://drive.deta.sh/v1/${id}/${user}`;

export const ProgressBar = ({ per }: { per: number }) => {
  return (
    <div className="w-[75vw] border-2 border-black p-[3px] rounded mr-1">
      <div className="bg-[green] rounded-md h-4" style={{ width: `${per}%` }}></div>
    </div>
  );
};
