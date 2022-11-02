import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import { fetch_post } from 'tools/fetch';
import { clsx } from 'tools/clsx';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineLogin, AiOutlineUserAdd } from 'react-icons/ai';
import { BiReset } from 'react-icons/bi';
import { GrPowerReset, GrUserAdd } from 'react-icons/gr';
import { FcHome } from 'react-icons/fc';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useRouter } from 'next/router';
import { authRes, storeAuthCookies } from 'tools/drive/cookie_info';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Blocker from 'tools/block';
import loadLangDB, { langKey, dattStruct } from 'langs';
import { atomWithStorage } from 'jotai/utils';
import { isLocalStorage, setIsLocalStorage } from 'state/ref/drive/shared';

const isProd = process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true';
type driveDattType = typeof dattStruct.drive.login;
const idAtom = atom('');
const passAtom = atom('');
const modeAtom = atom('main');
const rememberPassAtom = atomWithStorage('drive_remember_pass_atom', isLocalStorage);
let lekhaAtom: driveDattType = null!;

const DriveLogin: NextPage<{ lekhAH: driveDattType }> = ({ lekhAH }) => {
  const router = useRouter();
  lekhaAtom = lekhAH;
  const lekh = lekhaAtom.main;
  const [id, setId] = useAtom(idAtom);
  const [pass, setPass] = useAtom(passAtom);
  const [err, setErr] = useState(false);
  const [mode, setMode] = useAtom(modeAtom);
  const [remember, setRemember] = useAtom(rememberPassAtom);
  const passRef = useRef<HTMLInputElement>(null!);
  const idRef = useRef<HTMLInputElement>(null!);
  const cn = useRef(0);
  cn.current++;
  useEffect(() => {
    window.onpopstate = null;
    window.onbeforeunload = null;
    if (isProd) Blocker();
  }, []);
  const validate = async () => {
    const req = await fetch_post('/drive/login', {
      noUrlAdd: true,
      form: { username: id, password: pass }
    });
    setId('');
    setPass('');
    const rs = await req.json();
    if (req.status !== 200) {
      setErr(true);
      idRef.current.focus();
      if (req.status === 401)
        toast.error(rs.detail, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000
        });
      setTimeout(() => setErr(false), 750);
      return;
    }
    storeAuthCookies(rs as authRes);
    router.push('/drive');
  };
  return (
    <div className="p-2">
      <Head>
        <title>{lekhaAtom.title}</title>
        <link rel="icon" href="/drive.ico" />
      </Head>
      <form>
        <input
          ref={idRef}
          type="text"
          placeholder={lekh.id_input}
          autoComplete="off"
          spellCheck="false"
          className={clsx(
            'block mb-2 border-2 rounded-md outline-none text-2xl p-1 w-44 focus:ring-2 transition-all duration-200',
            !err
              ? 'border-blue-800 ring-green-500 placeholder:text-zinc-400'
              : 'border-rose-600 ring-rose-200 placeholder:text-orange-400'
          )}
          value={id}
          onChange={({ target: { value } }) => setId(value)}
          onKeyDown={({ nativeEvent: { keyCode } }) => {
            if (keyCode === 13 && passRef.current && mode == 'main') passRef.current.focus();
          }}
        />
        {mode !== 'reset' && (
          <input
            ref={passRef}
            type="password"
            placeholder={lekh.pass_input}
            autoComplete="off"
            className={clsx(
              'block my-2 border-2 rounded-md outline-none text-2xl p-1 w-44 focus:ring-2 transition-all duration-200',
              !err
                ? 'border-blue-800 ring-green-500 placeholder:text-zinc-400'
                : 'border-rose-600 ring-rose-200 placeholder:text-orange-400'
            )}
            value={pass}
            onChange={({ target: { value } }) => setPass(value)}
            onKeyDown={({ nativeEvent: { keyCode } }) => {
              if (keyCode === 13 && mode == 'main') validate();
            }}
          />
        )}
      </form>
      {mode === 'main' && (
        <>
          {cn.current > 1 && (
            <label
              className={clsx(
                'inline-block text-cyan-800 font-medium p-1 rounded-lg',
                'active:border-blue-600 active:text-black font-medium',
                `transition ${remember ? 'text-[green]' : 'text-[red]'}`
              )}
            >
              <input
                type="checkbox"
                checked={remember}
                className="mr-1"
                onChange={() => {
                  setRemember(!remember);
                  setIsLocalStorage(!remember);
                }}
              />
              <span>{lekh.remember_btn}</span>
            </label>
          )}
          <div>
            <AiOutlineLogin
              className="text-4xl ml-3 active:fill-blue-700"
              onClick={() => validate()}
            />
            <button
              onClick={() => setMode('reset')}
              className="border-2 border-fuchsia-700 text-cyan-800 font-medium p-1 rounded-lg mx-2 active:border-blue-600 active:text-red-500"
            >
              <BiReset className="text-xl text-black" />
              {lekh.reset_btn}
            </button>
          </div>
        </>
      )}
      {mode === 'reset' && <Reset />}
      {mode === 'new_user' && <NewUser />}
      <ToastContainer />
    </div>
  );
};

export default DriveLogin;

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale! as langKey;
  return {
    props: {
      lekhAH: loadLangDB(locale, 'login')?.drive.login
    }
  };
};

const Reset = () => {
  const lekh = lekhaAtom.reset;
  const setMode = useSetAtom(modeAtom);
  const [id, setId] = useAtom(idAtom);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const reset = async () => {
    if (currentPass === '' || newPass === '' || id === '') {
      toast.error(lekh.blank_msg, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000
      });
      return;
    }
    const req = await fetch_post('/drive/reset', {
      json: { currentPass, newPass, id }
    });
    const res = await req.json();
    if (req.status != 200) {
      toast.error(res.detail, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2500
      });
      return;
    }
    toast.success(res.detail, {
      position: toast.POSITION.TOP_LEFT,
      autoClose: 4000
    });
    setNewPass('');
    setCurrentPass('');
    setId('');
  };
  return (
    <div>
      <input
        type="password"
        className="block mb-1 border-2 border-emerald-600 rounded-lg p-1 w-40 text-sm"
        value={currentPass}
        onChange={({ target: { value } }) => setCurrentPass(value)}
        placeholder={lekh.current_pass}
      />
      <input
        type="password"
        className="block mb-1 border-2 border-emerald-600 rounded-lg p-1 w-40 text-sm"
        value={newPass}
        onChange={({ target: { value } }) => setNewPass(value)}
        placeholder={lekh.new_pass}
      />
      <button
        onClick={() => reset()}
        className="block border-2 border-fuchsia-700 text-cyan-800 font-medium p-1 rounded-lg mb-1 active:border-blue-600 active:text-red-500"
      >
        <GrPowerReset className="text-xl text-black mr-1" />
        {lekh.reset_btn}
      </button>
      <button
        onClick={() => setMode('new_user')}
        className="border-2 border-lime-600 text-emerald-600 font-medium p-1 rounded-lg active:border-blue-600 active:text-red-500"
      >
        <AiOutlineUserAdd className="text-xl text-black" />
        {lekh.new_user_btn}
      </button>
      <FcHome className="block mt-2 text-3xl ml-12 cursor-button" onClick={() => setMode('main')} />
    </div>
  );
};

const NewUser = () => {
  const lekh = lekhaAtom.new_user;
  const setMode = useSetAtom(modeAtom);
  const [id, setId] = useAtom(idAtom);
  const [pass, setPass] = useAtom(passAtom);
  const [mainPass, setMainPass] = useState('');
  const add_new_user = async () => {
    if (pass === '' || id === '' || mainPass === '') {
      toast.error(lekh.blank_msg, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000
      });
      return;
    }
    const req = await fetch_post('/drive/add_new_user', {
      json: { username: id, password: pass, mukhya: mainPass }
    });
    const res = await req.json();
    if (req.status != 200) {
      toast.error(res.detail, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2500
      });
      return;
    }
    toast.success(res.detail, {
      position: toast.POSITION.TOP_LEFT,
      autoClose: 4000
    });
    setId('');
    setPass('');
    setMainPass('');
  };
  return (
    <div>
      <input
        type="password"
        className="block mb-1 border-2 border-emerald-600 rounded-lg p-1 w-40 text-sm"
        value={mainPass}
        onChange={({ target: { value } }) => setMainPass(value)}
        placeholder={lekh.main_pass}
      />
      <button
        onClick={() => add_new_user()}
        className="border-2 border-orange-700 text-violet-700 font-medium p-1 rounded-lg  active:border-blue-600 active:text-red-500"
      >
        <GrUserAdd className="text-2xl text-black mr-1 ml-[2px]" />
        {lekh.add_btn}
      </button>
      <FcHome className="block mt-2 text-3xl ml-12 cursor-button" onClick={() => setMode('main')} />
    </div>
  );
};
