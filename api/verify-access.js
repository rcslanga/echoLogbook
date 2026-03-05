import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const { email } = req.body;
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
        const sheets = google.sheets({ version: 'v4', auth });

        // Lê a aba acessos (Assumindo Colunas: Nome, Email, Status)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
            range: 'acessos!A2:C',
        });

        const rows = response.data.values || [];
        // Procura o utilizador (ignorando maiúsculas/minúsculas)
        const user = rows.find(row => row[1] && row[1].toLowerCase() === email.toLowerCase());

        if (user && user[2] && user[2].toLowerCase() === 'on') {
            return res.status(200).json({ status: 'success', user: { name: user[0], email: user[1] } });
        } else {
            return res.status(403).json({ status: 'error', message: 'Acesso negado ou conta inativa.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Erro no servidor.' });
    }
}
