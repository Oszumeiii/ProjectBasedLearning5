const {Queue} = require("bullmq");
const IORedis = require("ioredis");

// configure redis connection
const redisConnection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null
});
 

const crawlQueue = new Queue("crawlQueue", {
    connection: redisConnection , 
    defaultJobOptions :{
        attempts : 1, // retry up to 3 times if the job fails
        backoff : {
            type : "exponential",
            delay : 10000 // initial delay of 10 seconds before retrying
        },
        removeOnComplete: true, // automatically remove job from queue when completed
        removeOnFail: false // keep failed jobs in the queue for debugging
    }
});

module.exports = crawlQueue;
