import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import { fetch_post } from 'tools/fetch';
import { clsx } from 'tools/clsx';
import { useState } from 'react';
import type { infoType } from 'components/tracker/TrackInfo';
import dynamic from 'next/dynamic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loadLangDB, { langKey, dattType } from 'langs';

const TrackInfo = dynamic(() => import('components/tracker/TrackInfo'), { ssr: false });

const Index: NextPage<{ lekh: dattType['tracker'] }> = ({ lekh }) => {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const [succes, setSucces] = useState(false);
  const [data, setData] = useState<infoType>(null!);
  const onClick = async () => {
    if (val === '') return;
    const req = await fetch_post(`/track_info`, { json: { key: val } });
    setVal('');
    if (req.status !== 200) {
      setErr(true);
      toast.error(lekh.pass_error, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000
      });
      setTimeout(() => setErr(false), 750);
      return;
    }
    setData(await req.json());
    setSucces(true);
  };
  return (
    <div className="p-2">
      <Head>
        <title>{lekh.title}</title>
      </Head>
      {!succes && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onClick();
          }}
        >
          <input
            type="password"
            placeholder={lekh.pass_input}
            autoComplete="off"
            className={clsx(
              'border-2 rounded-md outline-none text-2xl p-1 w-44 focus:ring transition-all duration-200',
              !err
                ? 'border-blue-800 ring-green-500 placeholder:text-zinc-400'
                : 'border-rose-600 ring-rose-200 placeholder:text-orange-400'
            )}
            value={val}
            onChange={({ target: { value } }) => setVal(value)}
          />
        </form>
      )}
      {succes && <TrackInfo data={data} />}
      <ToastContainer />
    </div>
  );
};

export default Index;
export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale! as langKey;
  return {
    props: {
      lekh: loadLangDB(locale, 'tracker')?.tracker
    }
  };
};
