const { Worker } = require("bullmq");
const { Queue } = require("bullmq");

const IORedis = require("ioredis");
const axios = require("axios");



const redisConnection = new IORedis({
    host: "redis", 
    port: 6379,
    maxRetriesPerRequest: null,
});


const crawlWorker = new Worker(
    "crawlQueue",
    async (job) => {
        console.log(`🚀 Processing job ${job.id}`);

        try {
            const { niche, niche_id, max_links } = job.data;

            console.log(`📌 Niche: ${niche} | ID: ${niche_id}`);

            await axios.post(
                "http://crawler:8000/instagram/crawl",
               // "http://localhost:8000/instagram/crawl",
                {
                    niche,
                    niche_id,
                    max_links: max_links || 20
                },
                {
                    timeout: 5*60000,
                }
            );

            return { status: "triggered" };

        } catch (error) {
            console.error(`❌ Job ${job.id} failed:`, {
                message: error.message,
  
            });
            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 1
    }
);

crawlWorker.on("completed", (job) => {
    console.log(`🎉 Job ${job.id} completed`);
});

crawlWorker.on("failed", (job, err) => {
    console.log(`💥 Job ${job.id} failed: ${err.message}`);
});

crawlWorker.on("error", (err) => {
    console.error("🔥 Worker error:", err);
});

console.log("👷 Crawl Worker is running...");