import { atom } from 'jotai';
import { dattStruct } from 'langs';
export const filesAtom = atom<any>({});
export const currentLocAtom = atom('/');
export const refreshFilesAtom = atom<[string[], 'add' | 'delete']>([null!, null!]);

export const listElement: { current: HTMLDivElement } = { current: null! };
type driveMainType = typeof dattStruct.drive.main;
export let lekhaAtom: driveMainType = null!;
export const setLekhaAtom = (v: driveMainType) => {
  lekhaAtom = v;
};
