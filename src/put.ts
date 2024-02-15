import path from "path";

import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  30
);

export function createRandomSuffixPath(pathname: string) {
  const extname = path.extname(pathname);

  return pathname.replace(extname, `-${nanoid()}${extname}`);
}
