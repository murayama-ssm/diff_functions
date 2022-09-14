module.exports = async () => {
  const { Storage } = require("@google-cloud/storage");
  const axios = require("axios");
  require("dotenv").config();

  const date = new Date().toLocaleDateString().split("/");
  const fileName =
    date[2].split(",")[0] +
    date[0].padStart(2, "0") +
    date[1].padStart(2, "0") +
    ".json";

  async function start() {
    await saveData("campaign");
    await saveData("store-categories");
    await saveData("store");
    await saveData("quick-facts");
    await saveData("miyawaka-topics");
    await saveData("finantial-results");
    await saveData("medium");
    await saveData("category");
    await saveData("topics");
  }

  await start();

  async function saveData(target) {
    return new Promise((resolve, reject) => {
      let headers = {
        "X-MICROCMS-API-KEY": process.env.X_MICROCMS_API_KEY,
      }
      axios
        .get(`https://trial-net.microcms.io/api/v1/${target}?limit=400`, {
          headers: headers,
        })
        .then((res) => {
          const storage = new Storage();
          const bucket = storage.bucket("trial-microcms");
          const file = bucket.file(target + "/" + fileName);
          file
            .save(JSON.stringify(res.data))
            .then(() => {
              console.log(`>>>>>>> ${target} saved`);
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};
