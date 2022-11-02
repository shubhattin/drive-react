import type { FC } from 'react';
import { useRef, useState } from 'react';
import Select from 'components/Select';
import { clsx } from 'tools/clsx';
export interface infoType {
  [x: string]: {
    name: string;
    info: {
      [x: string]: number;
    };
  };
}

const TrackInfo: FC<{ data: infoType }> = ({ data }) => {
  const cnt = useRef(0); // render count
  const [val, setVal] = useState('jala' in data ? 'jala' : Object.keys(data)[0]);
  const t_cn_nm = 'परिगणना'; // name of total count key
  const list = (() => {
    let ls = Object.keys(data[val].info);
    if (ls.indexOf(t_cn_nm) !== -1) {
      delete ls[ls.indexOf(t_cn_nm)];
      ls.unshift(t_cn_nm);
    }
    return ls;
  })();
  cnt.current++;
  return (
    <>
      <Select
        className={clsx(
          'text-2xl font-bold mb-4 text-rose-500 p-1.5 outline-none border-2 border-black rounded-md bg-white select-none',
          'focus:ring hover:ring ring-green-500 transition-all duration-200 hover:text-rose-600 focus:text-rose-600 active:text-amber-700'
        )}
        value={val}
        onChange={({ target: { value } }) => setVal(value)}
      >
        {Object.keys(data).map((v) => (
          <option className={val === v ? 'text-green-800' : ''} value={v} key={v}>
            {data[v].name}
          </option>
        ))}
      </Select>
      <ul
        className={clsx(
          'mx-4 text-lg font-semibold text-fuchsia-800',
          `[&>li]:before:content-['•'] [&>li]:before:text-green-700 [&>li]:before:mr-1.5`
        )}
      >
        {list.map((nm) => {
          const count = data[val].info[nm];
          return (
            <li
              className="hover:before:text-black hover:text-fuchsia-600 group"
              key={nm}
              style={nm === t_cn_nm ? { color: 'blue' } : {}}
            >
              {nm} - <span className="text-amber-800 group-hover:text-blue-700">{count}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default TrackInfo;
