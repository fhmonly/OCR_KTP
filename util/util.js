const db = require("../config/database/connection")
const axios = require("axios");
const moment = require("moment");
const storageServicesUrl = process.env.STORAGE_URL_IMAGES;

/**
 * Global check exist
 *
 * @param query {Knex.QueryBuilder<> | Knex.QueryInterface<>}
 * @return {Promise<boolean> | Promise<error>}
 */
exports.checkExistTable = async query => {
    const [[{check}]] = await db.raw(`select exists(${query.first(1).toQuery()}) as \`check\``)
    return !!check
}

exports.checkPartnerExistTable = async query => {
    return dbPartner.raw(`select exists(${query.first(1).toQuery()}) as check`);
}

exports.typeOrderList = () => {
    return [
        'smm',
        'nig',
        'prm',
        'cmp',
        'stt',
    ]
}

exports.statusOrderCheck = (status_id, post_tayang = false) => {
    let sts_info = ''
    let sts_color = 'grey'
    let sts_pending = [2, 3, 6]
    let sts_progress = [4, 6]
    let sts_complete = [7, 15]
    let sts_cancel = [1, 10, 9, 13]

    // Check status_id
    if (sts_cancel.includes(status_id)) {
        sts_info = 'Canceled';
        sts_color = 'red'
    } else if (sts_pending.includes(status_id)) {
        sts_info = 'Pending';
        sts_color = 'grey'
    } else if (sts_progress.includes(status_id)) {
        if (post_tayang) {
            sts_info = 'In Progress';
            sts_color = 'yellow'
        } else {
            sts_color = 'grey'
            sts_info = 'Pending';
        }
    } else if (sts_complete.includes(status_id)) {
        if (post_tayang) {
            sts_color = 'green'
            sts_info = 'Complete';
        }
    }

    return {
        sts_color,
        sts_info
    };
}

exports.getLastDayOfMonth = (year, month) => {
    const nextMonth = new Date(year, month + 1, 1);
    const lastDay = new Date(nextMonth - 1);
    return lastDay.getDate();
}

exports.ucwords = (str) => {
    return str.replace(/\b\w/g, function(match) {
        return match.toUpperCase();
    });
}

exports.sentSlackNotifications = async (type, error) => {
    await axios.post(process.env.SLACK_URL, {
        text: `[${moment().format("YYYY-MM-DD HH:mm:ss")}] \`${type}\` - faq service \`\`\` ${JSON.stringify(error)} \`\`\` `
    })
}


exports.getFilesAws = async (key) => {
    if (!key) return null
    const responseApi = await axios.post(`${storageServicesUrl}api/getSignedFiles`, {
        file: key
    }).catch(e => {
        if (e.response) {
            console.log(e.response.data)
        }
        return null
    })
    if (!responseApi) return null

    return responseApi.data.data
}

exports.runningSchedule = async ()=>{
    try{
        let query = db("faqs")
            .where("status", 2)
            .where("publish_date", "<=", moment().format("YYYY-MM-DD HH:mm:ss"))
            .select(
                "id",
            )
        const result = await query
        if(result.length){
            await query.clone().update({
                status: 1
            })
        }
        return true;
    }catch (e) {
        return false;
    }
}