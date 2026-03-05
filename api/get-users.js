import { google } from 'googleapis';

export default async function handler(req, res) {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
        const sheets = google.sheets({ version: 'v4', auth });

        // Lê a aba userlist (Colunas: Nome, Email)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: 'userlist!A2:B',
        });

        const rows = response.data.values || [];
        const usersList = rows.map(row => `${row[0]} | ${row[1]}`).filter(u => u !== 'undefined | undefined');

        return res.status(200).json({ status: 'success', users: usersList });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Erro ao buscar utilizadores.' });
    }
}
