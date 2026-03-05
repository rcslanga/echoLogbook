const { google } = require('googleapis');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle GET for getting initial data or history
    if (req.method === 'GET') {
        if (req.query.action === 'getInitialData') {
            return res.status(200).json({ status: 'success', motoristas: ["Agostinho Mujanda", "Alberto Barros", "Arlindo Cossa", "Bernardo Nsicuzinaimue", "Carlos Mirassy", "Carlos Saboia", "Edson de Sousa", "Faizal Matuare Alide", "Fernando Muianga", "Fungai Ulhanane", "Herminio Muchave", "Inacio Paulo Augusto Junior", "Joao Aide", "Joao Bonda", "Joao Massocha", "Joao Paulo Ganje", "Jone Juze Aleixo", "Manuel Jose", "Manuel Xavier", "Marcos Campaunda", "Moises Ndoa", "Rajhi Mussa", "Raul Baptista", "Silvestre Angelica"] });
        }
        if (req.query.action === 'getHistory') {
            return res.status(200).json({ status: 'success', history: [] }); // Placeholder for GET
        }
        return res.status(200).json({ message: 'ECHO Drive API running.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        // Auth with Google
        const rawCreds = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
        if (!rawCreds) throw new Error("Missing Google Service Account credentials");

        const credentials = JSON.parse(rawCreds);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        if (!spreadsheetId) throw new Error("Missing Spreadsheet ID");

        const action = data.action || 'logbook';
        let targetSheet = 'DB_Logbook';
        if (action === 'maintenance') targetSheet = 'DB_Maintenance';
        if (action === 'incident') targetSheet = 'DB_Incidents';

        const timestamp = new Date().toISOString();

        const row = [
            timestamp,
            data.motorista || '',
            data.viatura || '',
            data.dataViagem || '',
            data.partida || '',
            data.chegada || '',
            data.kmInicial || '',
            data.kmFinal || '',
            data.taskCode || '',
            data.provincia || '',
            data.passageiro || '',
            data.origem || '',
            data.destino || '',
            data.observacoes || '',
            JSON.stringify(data.abastecimentos || [])
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${targetSheet}!A:A`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] }
        });

        return res.status(200).json({ status: 'success', message: 'Dados gravados com sucesso' });

    } catch (error) {
        console.error('Error appending data:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
