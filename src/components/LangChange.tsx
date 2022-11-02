import { useRouter } from 'next/router';
import { useState } from 'react';

const LangChange = () => {
  const router = useRouter();
  const [val, setVal] = useState(router.locale!);
  return (
    <div>
      <select
        className="w-4 h-4 fixed bottom-0 right-1 bg-zinc-100"
        value={val}
        onChange={({ target: { value } }) => {
          setVal(value);
          router.push(router.asPath, undefined, { locale: value });
        }}
      >
        {router.locales?.map((vl) => (
          <option value={vl} key={vl}>
            {vl}
          </option>
        ))}
      </select>
    </div>
  );
};
export default LangChange;
