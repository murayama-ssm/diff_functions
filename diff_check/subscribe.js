/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.helloPubSub = async (event, context) => {
    const { Storage } = require('@google-cloud/storage');
    const mkdirp = require('mkdirp');

    async function uploadImage(filePath, destination) {
        const bucketName = 'murayama_bucket2'
        const storage = new Storage();
        const bucket = storage.bucket(bucketName);
        await bucket.upload(filePath, { destination });
    }

    mkdirp.sync('/tmp/reg-cli-expected');
    mkdirp.sync('/tmp/reg-cli-actual');

    // const id = 546
    const id = Number(Buffer.from(event.data, 'base64').toString())

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    await page.goto(`https://trial-website-staging.web.app/shops/${id}/`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `/tmp/reg-cli-expected/${id}-screenshot.png`, fullPage: true });
    await uploadImage(`/tmp/reg-cli-expected/${id}-screenshot.png`, `reg-cli-expected/${id}-screenshot.png`)

    await page.goto(`https://www.trial-net.co.jp/shops/${id}/`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `/tmp/reg-cli-actual/${id}-screenshot.png`, fullPage: true });
    await uploadImage(`/tmp/reg-cli-actual/${id}-screenshot.png`, `reg-cli-actual/${id}-screenshot.png`)

    await browser.close()
};
