import { atom } from 'jotai';
import { listElement } from 'state/drive';

export const SEARCH_STR = 'label>input[type=checkbox]';

export let kAryaCount = 0;
export const setKaryaCount = (val: number) => {
  kAryaCount = val;
};

export let current_req: XMLHttpRequest = null!;
export const setCurrent_req = (val: typeof current_req) => {
  current_req = val;
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
