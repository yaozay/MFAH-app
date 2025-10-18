const getParseData = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  });
};

module.exports = getParseData;
