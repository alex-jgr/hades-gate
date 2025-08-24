getPostBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', err => {
      reject(err);
    });
  });
};

getParams = (body) => {
  const params = {};
  if (!body) return params;

  body.split('&').forEach(param => {
    const [key, value] = param.split('=');
    const decodedValue = decodeURIComponent(value);
    params[key] = decodedValue.length ? decodedValue : undefined;
  });

  return params;
};

getPostParams = async (req) => {
  const body = await getPostBody(req)

  return getParams(body);
};

exports.getParams = getParams;
exports.getPostBody = getPostBody;
exports.getPostParams = getPostParams;
