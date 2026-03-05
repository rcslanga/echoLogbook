import { google } from 'googleapis';

export default async function handler(req, res) {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
        const sheets = google.sheets({ version: 'v4', auth });

        // Lê a aba DB_Logbook
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: 'DB_Logbook!A2:N', // Ajuste a letra final conforme o número de colunas
        });

        const rows = response.data.values || [];
        // Pega apenas nas últimas 10 linhas e inverte a ordem (mais recentes primeiro)
        const recentRows = rows.slice(-10).reverse();

        const history = recentRows.map(row => ({
            Timestamp: row[0],
            Motorista: row[1],
            Viatura: row[2],
            Partida: row[3],
            Chegada: row[4],
            'KM Inicial': row[5],
            'KM Final': row[6]
        }));

        return res.status(200).json({ status: 'success', history });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Erro ao buscar histórico.' });
    }
}
