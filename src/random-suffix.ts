import path from "path";

import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  30
);

export function randomSuffix(pathname: string) {
  const extname = path.extname(pathname);

  return pathname.replace(extname, `-${nanoid()}${extname}`);
}

export function removeRandomSuffix(pathname: string) {
  const extname = path.extname(pathname);

  const reg = new RegExp(`-[0-9A-Za-z]{30}${extname}$`);

  return pathname.replace(reg, extname);
}
