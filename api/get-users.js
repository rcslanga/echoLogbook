const { google } = require('googleapis');

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Apenas método GET permitido' });
    }

    try {
        // Puxa as credenciais da variável de ambiente do Vercel
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        
        // Autenticação segura
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        // ATENÇÃO: Substitua pelo ID real da sua Planilha (encontra-se no URL da folha do Google)
        const SPREADSHEET_ID = 'COLOQUE_AQUI_O_ID_DA_SUA_PLANILHA';

        // Vai à aba 'userlist' e lê da linha 2 em diante, colunas A e B
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'userlist!A2:B', 
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.status(200).json({ users: [] });
        }

        // Formata os dados para o padrão "Nome | Email"
        const usersList = rows.map(row => {
            const nome = row[0] || '';
            const email = row[1] || '';
            return `${nome} | ${email}`;
        }).filter(u => u !== ' | '); // Filtra linhas vazias

        return res.status(200).json({ users: usersList });

    } catch (error) {
        console.error('Erro ao ler utilizadores:', error);
        return res.status(500).json({ message: 'Erro de ligação à Google Sheet' });
    }
}
