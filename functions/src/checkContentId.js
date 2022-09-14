module.exports = async() => {
    const axios = require("axios");
    
    const getContents = (params) => {
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

    const getAllContents = async (limit = 200, offset = 0) => {
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

    const contents = await getAllContents()
    for (const content of contents) {
        if (isNaN(Number(content.id))) {
            console.log(`invalid_content_id : ${content.id}`)
        }
    }
};