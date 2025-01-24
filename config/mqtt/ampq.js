const amqp = require("amqplib");

/**
 * generating channel
 * @returns {Promise<Channel>}
 */
exports.createChannel = async () => {
    const ampqConnection = await amqp.connect(`amqp://${process.env.MQTT_USERNAME}:${process.env.MQTT_PASSWORD}@${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`);
    const channel = await ampqConnection.createChannel();
    process.on('exit', () => {
        channel.close()
        ampqConnection.close()
    })
    return channel;
}
