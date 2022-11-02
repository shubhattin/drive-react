import type { FC } from 'react';

const ImageSpan: FC<{ className: string; src: string }> = ({ className, src }) => {
  return (
    <span
      className={`inline-block bg-cover ${className}`}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
};
export default ImageSpan;
