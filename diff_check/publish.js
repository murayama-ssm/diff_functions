/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.helloWorld = async (req, res) => {
    function getContents(params) {
        const axios = require("axios")
        return new Promise((resolve, reject) => {
            axios.get(`https://trial-net.microcms.io/api/v1/store`, {
                params: params,
                headers: {
                    // "X-MICROCMS-API-KEY": process.env.X_MICROCMS_API_KEY
                    "X-MICROCMS-API-KEY": "9bca79b2c9a64df9b940a2bed54373e9be8e"
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
        // if (response.offset + response.limit < response.totalCount) {
        //     const contents = await getAllContents(response.limit, response.offset + response.limit)
        //     return [...response.contents, ...contents]
        // }
        return response.contents
    }

    const topicNameOrId = 'test-pubsub';
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

    const contents = await getAllContents(10)
    const promiseList = []

    for (const content of contents) {
        promiseList.push(publishMessage(content.id))
    }
    await Promise.all(promiseList)

    console.log('Finished!')
    res.send('OK');
};
