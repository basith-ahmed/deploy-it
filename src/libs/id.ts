const MAX_LEN = 5;

export function generate_id() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < MAX_LEN; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
