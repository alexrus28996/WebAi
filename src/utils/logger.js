const logWithLevel = (level, payload) => {
  const data = payload && typeof payload === 'object' ? payload : { message: payload };
  const entry = { level, ...data };
  console.log(JSON.stringify(entry));
};

const info = (payload) => logWithLevel('info', payload);
const warn = (payload) => logWithLevel('warn', payload);
const error = (payload) => logWithLevel('error', payload);

module.exports = {
  info,
  warn,
  error
};
