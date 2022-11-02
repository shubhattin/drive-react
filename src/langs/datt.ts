import list from './locales.json';
import { load } from 'js-yaml';
import { set_val_from_adress } from 'tools/json';
import * as fs from 'fs';
import { model } from './model';

export type langKey = keyof typeof list; // Language list
export const dattStruct = model; // Basic Structure of all Language DataBases
export type dattType = typeof dattStruct;
export const langNames = Object.values(list);

const reuseValues = (datt: dattType) => {
  const { drive, tracker } = datt;
  const reuseMap = [
    [drive.login.reset.blank_msg, ['datt.drive.login.new_user.blank_msg']],
    [drive.login.main.pass_input, ['datt.tracker.pass_input']],
    [
      drive.main.fileBar.Delete.yes,
      ['datt.drive.main.fileBar.Logout.yes', 'datt.drive.main.fileBar.Upload.yes']
    ],
    [
      drive.main.fileBar.NewFolder.no,
      ['datt.drive.main.fileBar.Delete.no', 'datt.drive.main.fileBar.Logout.no']
    ],
    [drive.main.fileBar.Download.download_msg, ['datt.drive.main.fileBar.FileView.download_msg']]
  ];
  for (let x of reuseMap)
    for (let y of x[1]) set_val_from_adress(y.substring(4).split('.').join('/'), datt, x[0]);
  return datt;
};
const db: { [x in langKey]?: dattType } = {};
const main = (locale: langKey, type = '') => {
  if (process.env.NODE_ENV === 'production' && locale in db) return db[locale];
  const LOAD: any = load(fs.readFileSync(`./src/langs/data/${list[locale]}.yaml`).toString());
  let dt = reuseValues(LOAD.client as dattType);
  db[locale] = dt;
  return dt;
};
export default main;
