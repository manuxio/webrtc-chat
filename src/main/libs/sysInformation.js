import si from 'systeminformation';
const getSystemInfo = async () => {
  const retval = {};
  return si.cpu()
  .then(data => retval.cpu = data)
  .then(() => si.osInfo())
  .then(data => retval.osInfo = data)
  .then(() => si.graphics())
  .then(data => retval.graphics = data)
  .then(() => si.networkInterfaces())
  .then(data => retval.networkInterfaces = data)
  .then(
    () => retval
  );
}

export default getSystemInfo;