/**
 * 店舗情報を全件取得した後、スクリーンショットをpararrelに撮影するためTOPICをpublishする
 */
module.exports = async (req, res) => {
    function getContents(params) {
        const axios = require("axios")
        return new Promise((resolve, reject) => {
            axios.get(`https://trial-net.microcms.io/api/v1/store`, {
                params: params,
                headers: {
                    "X-MICROCMS-API-KEY": process.env.X_MICROCMS_API_KEY
                }
            }).then((res) => {
                resolve(res.data)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    const getAllContents = async function (limit = 200, offset = 0) {
        const params = {
            fields: 'id',
            limit,
            offset
        }
        const response = await getContents(params)
        if (response.offset + response.limit < response.totalCount) {
            const contents = await getAllContents(response.limit, response.offset + response.limit)
            return [...response.contents, ...contents]
        }
        return response.contents
    }

    const topicNameOrId = process.env.TOPIC
    const { PubSub } = require('@google-cloud/pubsub');

    const pubSubClient = new PubSub();

    async function publishMessage(contentsId) {
        return new Promise(async (resolve) => {
            const dataBuffer = Buffer.from(contentsId);

            try {
                const messageId = await pubSubClient
                    .topic(topicNameOrId)
                    .publishMessage({ data: dataBuffer });
                console.log(`Message ${messageId} published.`);
            } catch (error) {
                console.error(`Received error while publishing: ${error.message}`);
                process.exitCode = 1;
            }

            resolve()
        })
    }

    const contents = await getAllContents()
    const promiseList = []

    for (const content of contents) {
        promiseList.push(publishMessage(content.id))
    }
    await Promise.all(promiseList)

    console.log('Finished!')
};
