import type { FC } from 'react';
import type { ChangeEvent, SelectHTMLAttributes } from 'react';
import { useEffect, useRef, useState } from 'react';

const Select: FC<SelectHTMLAttributes<HTMLSelectElement>> = (props) => {
  const [width, setWidth] = useState(0);
  const cn = useRef(0); // render count
  const options = props.children as JSX.Element[];
  const children =
    cn.current !== 0 ? options : options.filter((opt_elm) => opt_elm.props.value === props.value);
  const change = (e: ChangeEvent<HTMLSelectElement>) => {
    const { target } = e;
    if ('onChange' in props) props.onChange!(e);
    setWidth(resize(target));
  };
  useEffect(() => {
    cn.current++;
    setWidth(resize(elm.current));
  }, []);
  const elm = useRef<HTMLSelectElement>(null!);
  return (
    <select
      {...props}
      onChange={change}
      ref={elm}
      style={cn.current !== 0 ? { width: `${width}px` } : {}}
    >
      {children}
    </select>
  );
};
export default Select;

const replace_all = (str: string, replaceWhat: string, replaceTo: string) => {
  replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  var re = new RegExp(replaceWhat, 'g');
  return str.replace(re, replaceTo);
};
const resize = (target: HTMLSelectElement, extra = 0) => {
  target.style.removeProperty('width');
  let i = target.innerHTML;
  let o = target.outerHTML;
  o = replace_all(o, i, '');
  o = replace_all(o, 'id=', 'idk=');
  const tmp_el = document.createElement('div');
  tmp_el.innerHTML = o;
  const elm = tmp_el.firstChild! as HTMLSelectElement;
  elm.innerHTML = `<option>${target.querySelector('option:checked')?.innerHTML}</option>`;
  document.body.appendChild(elm);
  const wdth = elm.offsetWidth + extra;
  elm.remove();
  return wdth;
};
