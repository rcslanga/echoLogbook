import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const data = req.body;
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
        const sheets = google.sheets({ version: 'v4', auth });
        
        const timestamp = new Date().toLocaleString('pt-PT', { timeZone: 'Africa/Maputo' });
        let range = '';
        let values = [];

        // Roteamento baseado na "action" enviada pelo HTML
        if (data.action === 'logbook') {
            range = 'DB_Logbook!A:A';
            values = [[
                timestamp, data.motorista, data.viatura, data.partida, data.chegada, 
                data.kmInicial, data.kmFinal, data.taskCode, data.provincia, 
                data.passageiro, data.origem, data.destino, data.observacoes, 
                JSON.stringify(data.abastecimentos) // Guarda a array de combustível como texto
            ]];
        } 
        else if (data.action === 'maintenance') {
            range = 'DB_Maintenance!A:A';
            values = [[
                timestamp, data.viatura, data.tipoServico, data.kmActuais, 
                data.custo, data.proximaRevisao, data.notas, data.submetidoPor
            ]];
        } 
        else if (data.action === 'incident') {
            range = 'DB_incidents!A:A';
            values = [[
                timestamp, data.provincia, data.viatura, data.tipoOcorrencia, 
                data.gravidade, data.localizacao, data.descricao, data.foto, data.submetidoPor
            ]];
        }
        else {
            return res.status(400).json({ status: 'error', message: 'Ação desconhecida.' });
        }

        // Escreve na Google Sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values },
        });

        return res.status(200).json({ status: 'success', message: 'Dados guardados com sucesso.' });

    } catch (error) {
        console.error('Erro na gravação:', error);
        return res.status(500).json({ status: 'error', message: 'Erro ao gravar na base de dados.' });
    }
}


