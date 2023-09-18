export function echo({ request: { message } }, callback) {
  callback(null, { message });
}
