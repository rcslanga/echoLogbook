import { google } from 'googleapis';

export default async function handler(req, res) {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
        const sheets = google.sheets({ version: 'v4', auth });

        // Tenta ler a aba (TEM DE SE CHAMAR DB_Logbook)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
            range: 'DB_Logbook!A2:G', 
        });

        const rows = response.data.values;
        
        // Se a aba estiver vazia, devolve array vazia sem dar erro 500
        if (!rows || rows.length === 0) {
            return res.status(200).json({ status: 'success', history: [] });
        }

        // Pega nas últimas 10 viagens (inverte para a mais recente ficar no topo)
        const recentRows = rows.slice(-10).reverse();

        const history = recentRows.map(row => ({
            Timestamp: row[0] || '',
            Motorista: row[1] || '',
            Viatura: row[2] || '',
            Partida: row[3] || '',
            Chegada: row[4] || '',
            'KM Inicial': row[5] || '0',
            'KM Final': row[6] || '0'
        }));

        return res.status(200).json({ status: 'success', history });

    } catch (error) {
        console.error("Erro no Histórico:", error);
        // Devolve o erro exato do Google para ser lido no ecrã da App
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
