import * as notifier from 'node-notifier';
import trackedUser from "./models/trackedUser";

const wa = require('@open-wa/wa-automate');
require('dotenv').config();
let argv = require('minimist')(process.argv.slice(2));

let lastState = false;
let isOnline = false;
const trackedNumbers = process.env.TRACKED_USERS_NUMBERS.split(",").map((item) => item.trim());
let pushbulletAccessToken = process.env.PUSHBULLET_ACCESS_TOKEN;

let Configs = {
    notification: stringToBool(process.env.NOTIFICATION),
    pushbulletNotification: stringToBool(process.env.PUSHBULLET_NOTIFICATION)
};

if (argv.n !== undefined) {
    Configs.notification = argv.n;
}
if (argv.p !== undefined) {
    Configs.pushbulletNotification = argv.p;
}
let pusher;
if (Configs.pushbulletNotification) {
    const PushBullet = require('pushbullet');
    pusher = new PushBullet(pushbulletAccessToken);
}

console.log("Program configurations: ", Configs);

let trackedUsers: trackedUser[] = [];

const launchConfig = {
    disableSpins: true
};
wa.create(launchConfig).then(async (client) => {
    // client.onMessage(message => {
    //     if (message.body === 'Hi') {
    //         client.sendText(message.from, '👋 Hello!');
    //     }
    // });
    let contact;
    for (let trackedNumber of trackedNumbers) {
        contact = await client.getContact(numberToContactId(Number(trackedNumber)));
        trackedUsers.push(new trackedUser(Number(trackedNumber), contact.formattedName));
    }
    await track(client);
    setInterval(async () => {
        await track(client);
    }, 500);
});

async function track(client) {
    trackedUsers = await trackedUser.checkOnline(client, trackedUsers);
    for (let trackedUser of trackedUsers) {
        if (trackedUser.stateChange) {
            if (trackedUser.isOnline) {
                console.log(`${trackedUser.name} is online`, new Date().toLocaleTimeString());
                if (Configs.notification) {
                    notifier.notify({
                        title: 'TrackWhatsappPresence',
                        message: `${trackedUser.name} is online`
                    });
                }
                if (Configs.pushbulletNotification) pusher.note('', 'TrackWhatsappPresence', `${trackedUser.name} is online | ${new Date().toLocaleTimeString()}`);
            } else if (!trackedUser.isOnline) {
                console.log(`${trackedUser.name} is offline`, new Date().toLocaleTimeString());
                if (Configs.pushbulletNotification) {
                    notifier.notify({
                        title: 'TrackWhatsappPresence',
                        message: `${trackedUser.name} is offline`
                    });
                }
                if (Configs.pushbulletNotification) pusher.note('', 'TrackWhatsappPresence', `${trackedUser.name} is offline | ${new Date().toLocaleTimeString()}`);
            }
        }
    }
}

function numberToContactId(phoneNumber: number) {
    return phoneNumber + '@c.us';
}

function stringToBool(stringBool: string) {
    if (stringBool.toLowerCase() === "true") {
        return true;
    } else if (stringBool.toLowerCase() === "false") {
        return false;
    } else {
        return false;
    }
}
