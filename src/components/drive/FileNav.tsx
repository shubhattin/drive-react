import { BiArrowBack } from 'react-icons/bi';
import { currentLocAtom } from 'state/drive';
import { useAtom } from 'jotai';

/**
 * Helps to enable File Navigation in drive with native back click also
 */
export let Go_Back: () => void = null!;

const FileNav = () => {
  const [pre, setPre] = useAtom(currentLocAtom);
  const list = pre.substring(1).split('/');
  const go_back = () => {
    if (pre === '/') return;
    list.pop();
    setPre('/' + list.join('/'));
  };
  Go_Back = go_back;
  return (
    <div className="mt-2 mb-1.5">
      <BiArrowBack
        className="ml-[2px] text-2xl mr-3 cursor-button active:text-blue-800"
        onClick={() => go_back()}
      />
      <span className="font-semibold text-violet-900">
        <span onClick={() => setPre('/')} className="hover:text-black active:text-[red] px-[2px]">
          /
        </span>
        {list[0] !== '' &&
          list.map((key, i) => (
            <span key={key}>
              <span
                onClick={() => setPre('/' + list.slice(0, i + 1).join('/'))}
                className="mx-[2px] hover:text-purple-600 active:text-[red]"
              >
                {key}
              </span>
              {i === list.length - 1 ? '' : '/'}
            </span>
          ))}
      </span>
    </div>
  );
};
export default FileNav;
