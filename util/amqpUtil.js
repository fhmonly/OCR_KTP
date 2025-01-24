const {createChannel} = require("../config/mqtt/ampq");

let channel = null

/**
 *
 * @param template {string}
 * @param data
 * @returns {Promise<any>}
 */
exports.sendProducer = async (template, data) => {
    try {
        if (channel === null) {
            channel = await createChannel()
        }

        return await channel.sendToQueue(template, Buffer.from(JSON.stringify(data)), {durable: true});
    } catch (e) {
        console.log("failed to send template: ", template, data, e)
    }
}

/**
 *
 * @param to {String}
 * @param template_name {String}
 * @param params {array}
 * @return {Promise<void>}
 */
exports.sendWAMqtt = async (to, template_name, params) => {
    await this.sendProducer("sentWhatsApp", {to, template_name, params})
}

/**
 * send email axios
 *
 * @param email {string}
 * @param order_id {string}
 * @param nama_usaha_user {string}
 * @param wa_number {string}
 * @param address {string}
 * @param ordered_at {string}
 * @param service_titles
 * @param service_description
 * @param payment_type
 * @returns {Promise<void>}
 * @param {string} price
 * @param {string} service_titles
 * @param {string} service_description
 * @param {*} payment_type
 */
exports.sendEmailTransaction = async (email, order_id, nama_usaha_user, wa_number, address, ordered_at, price, service_titles, service_description, payment_type) => {
    await this.sendProducer('sentEmailTransactionSuccess', {
        email,
        order_id,
        nama_usaha_user,
        wa_number,
        address,
        ordered_at,
        price,
        service_titles,
        service_description,
        payment_type
    })
}

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
exports.addCustomerMqtt = async data => {
    await this.sendProducer('journalAddCustomer', data)
}

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
exports.addSalesInvoiceMqtt = async data => {
    await this.sendProducer('journalAddSalesInvoice', data)
}

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
exports.receivePaymentMqtt = async data => {
    await this.sendProducer('journalReceivePayment', data)
}

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
exports.receivePaymentMqttPeriod = async data => {
    await this.sendProducer('journalReceivePaymentPeriod', data)
}
