const axios = require('axios');

const lang = "en";
const message = "Yo im bot bye lmao";

const headers = {
    "Accept": "application/json",
    "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
}

async function run(){
    let randid = genID(8);
    console.log(`Session randID: ${randid}`);

    let status = await axios.get("https://omegle.com/status");
    if(!status?.data.servers || status?.data?.servers?.length < 1) throw new Error("No Omegle servers found or mailformed server response.");

    let server = `https://${status.data.servers[Math.floor(Math.random() * status.data.servers.length)]}.omegle.com`;

    console.log(`Session server: ${server}\n`);

    let start = await axios({
        method: "post",
        url: `${server}/start?caps=recaptcha2,t2&firstevents=1&spid=&randid=${randid}&lang=${lang}`,
        headers: headers
    });

    eventsParse(start.data.events);

    let int = setInterval(async () => {

        let events = await axios.post(`${server}/events`, new URLSearchParams({id: start.data.clientID}));

        if(events.data) {
            let dp = eventsParse(events.data);
            if(dp == 0) {
                sendMessage(server, start.data.clientID, message);
                clearInterval(int);
            }
            if(dp == 1) clearInterval(int);
        }

    }, 1000);

}

run();

function eventsParse(eArr){
    let result;

    eArr.forEach(eventArray => {

        switch (eventArray[0]) {
            case 'waiting':
                console.log("Connecting...");
                break;

            case 'connected':
                console.log("Connected!");
                result = 0;
                break;

            case 'serverMessage':
                console.log("Server:", eventArray[1]);
                break;

            case 'gotMessage':
                console.log("Stranger:", eventArray[1]);
                break;

            case 'typing':
            case 'identDigests':
            case 'statusInfo':
                break;

            case 'strangerDisconnected':
                console.log("Stranger has disconnected!\n");
                result = 1;
                break;
        
            default:
                console.log("[Parser] Unknown event:", eventArray);
                break;
        }

    });

    return result;
}

async function sendMessage(server, id, message){
    let r = await axios.post(`${server}/send`, new URLSearchParams({msg: message, id: id}));
    console.log("You:", message);
    return r.data;
}

// Right from the omegle.js source code
function genID(){
    for(var a = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ", b="", c= 0; 8 > c; c++){
        var d = Math.floor(Math.random() * a.length);
        b += a.charAt(d)
    }

    return b
}
