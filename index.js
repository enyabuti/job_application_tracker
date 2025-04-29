const fs = require('fs');
const { google } = require('googleapis');
const { Parser } = require('json2csv');


const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';


const credentials = require('./credentials.json');


async function authorize() {
    const { client_secret, client_id } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "urn:ietf:wg:oauth:2.0:oob");

    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    } else {
        return getNewToken(oAuth2Client);
    }
}


function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this URL:', authUrl);

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve, reject) => {
        readline.question('Enter the code from that page here: ', (code) => {
            readline.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return reject(err);
                oAuth2Client.setCredentials(token);
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log('Token stored to', TOKEN_PATH);
                resolve(oAuth2Client);
            });
        });
    });
}

async function listMessages(auth) {
    const gmail = google.gmail({ version: 'v1', auth });

    let applications = [];
    let nextPageToken = null;

    do {
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: '(subject:application OR subject:"thank you for applying" OR subject:rejected OR subject:unfortunately OR subject:regret) after:2025/01/01',
            maxResults: 100,
            pageToken: nextPageToken,
        });

        const messages = res.data.messages || [];
        nextPageToken = res.data.nextPageToken;

        console.log(`Fetched ${messages.length} messages.`);

        for (const message of messages) {
            const msg = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'metadata',
                metadataHeaders: ['Subject', 'From', 'Date'],
            });

            const headers = msg.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
            const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date';

            const isRejected = /rejected|unfortunately|regret|not moving forward|no longer under consideration/i.test(subject);

            applications.push({
                Company: from,
                Position: subject,
                ApplyDate: isRejected ? '' : date,
                Status: isRejected ? 'Rejected' : 'Applied',
                RejectionDate: isRejected ? date : ''
            });
        }
    } while (nextPageToken);

    if (applications.length > 0) {
        applications.sort((a, b) => {
            const dateA = new Date(a.ApplyDate || a.RejectionDate);
            const dateB = new Date(b.ApplyDate || b.RejectionDate);

            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;

            return a.Company.localeCompare(b.Company);
        });

        const fields = ['Company', 'Position', 'ApplyDate', 'Status', 'RejectionDate'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(applications);

        fs.writeFileSync('applications.csv', csv);
        console.log(`✅ Applications saved to applications.csv! Total jobs: ${applications.length}`);
    } else {
        console.log('No applications found.');
    }
}

// --- MAIN FUNCTION ---
async function main() {
    const auth = await authorize();
    await listMessages(auth);
}

main(); 
