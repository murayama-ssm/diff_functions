module.exports = (file, context) => {
  const https = require("https");
  require("dotenv").config();

  let data;
  const isFront = file.name.split(".")[0].slice(-1) === "o";
  const storeCode = file.name.slice(8, 12);

  if (isFront) {
    data = {
      flyer_front: `https://storage.googleapis.com/trial-flyer/${file.name}`,
      flyer_front_period: file.name.slice(0, 8),
    };
  } else {
    data = {
      flyer_back: `https://storage.googleapis.com/trial-flyer/${file.name}`,
      flyer_back_period: file.name.slice(0, 8),
    };
  }

  const options = {
    hostname: "trial-net.microcms.io",
    port: 443,
    path: `/api/v1/store/${storeCode}`,
    method: "PATCH",
    headers: {
      "X-MICROCMS-API-KEY": process.env.X_MICROCMS_API_KEY,
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`, `fileName: ${file.name}`);
  });

  req.write(JSON.stringify(data));
  req.end();
};
