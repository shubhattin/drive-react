import type { NextRouter } from 'next/router';
export let Router: NextRouter = null!;
export const setRouter = (val: NextRouter) => {
  Router = val;
};
