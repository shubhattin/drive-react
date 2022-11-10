import { atom } from 'jotai';
import type { dattType } from 'langs';
export const filesAtom = atom<any>({});
export const currentLocAtom = atom('/');
export const refreshFilesAtom = atom<[string[], 'add' | 'delete']>([null!, null!]);

export const listElement: { current: HTMLDivElement } = { current: null! };
type driveMainType = dattType["drive"]["main"];
export let lekhaAtom: driveMainType = null!;
export const setLekhaAtom = (v: driveMainType) => {
  lekhaAtom = v;
};
