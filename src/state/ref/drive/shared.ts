// This stores shared references between drive pages

/**
 * This variables store status if to fetch value from `localStorage` or `sessionStorage`
 */
export let isLocalStorage = true;
export const setIsLocalStorage = (vl: boolean) => {
  isLocalStorage = vl;
};
