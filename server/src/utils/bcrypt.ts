import bcrypt from "bcrypt";

export async function hashValue(value: string) {
  const hash = await bcrypt.hash(value, 10);
  return hash;
}

export async function compareValue(value: string, hash: string) {
  const isMatch = await bcrypt.compare(value, hash);
  return isMatch;
}
