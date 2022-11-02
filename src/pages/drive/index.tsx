import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import FileList from '@drive/FileList';
import FileBar from '@drive/FileBar';
import FileNav, { Go_Back } from '@drive/FileNav';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Blocker from 'tools/block';
import { lekhaAtom, setLekhaAtom } from 'state/drive';
import loadLangDB, { langKey } from 'langs';
import { setRouter } from 'state/ref/drive';
import { useRouter } from 'next/router';

const isProd = process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true';

const DriveIndex: NextPage<{ lekhAH: typeof lekhaAtom }> = ({ lekhAH }) => {
  const router = useRouter();
  setRouter(router);
  setLekhaAtom(lekhAH);
  const lekh = lekhaAtom;
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
      Go_Back();
    };
    if (isProd) {
      window.onbeforeunload = () => 'किं भवान्वास्तवमेव प्रतिगन्तुमिच्छसि';
      Blocker();
    }
  }, []);
  return (
    <div className="p-2 ">
      <Head>
        <title>{lekh.title}</title>
        <link rel="icon" href="/drive.ico" />
      </Head>
      <FileNav />
      <FileBar />
      <FileList />
      <ToastContainer />
    </div>
  );
};

export default DriveIndex;

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale! as langKey;
  return {
    props: {
      lekhAH: loadLangDB(locale, 'drive')?.drive.main
    }
  };
};
