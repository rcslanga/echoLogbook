import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const data = req.body;
        
        // 1. Configuração de Autenticação
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
        const sheets = google.sheets({ version: 'v4', auth });
        
        // UNIFICAÇÃO: Usamos apenas uma variável para o ID da folha
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID; 
        const timestamp = new Date().toLocaleString('pt-PT', { timeZone: 'Africa/Maputo' });

        // ==========================================
        // ROTA 1: LOGBOOK (Viagens e Combustível)
        // ==========================================
        if (data.action === 'logbook') {
            
            // A. Gravar Viagem Principal
            const logbookValues = [[
                timestamp, data.provincia, data.viatura, data.motorista, 
                data.kmInicial, data.kmFinal, data.taskCode, data.passageiro, 
                data.origem, data.destino, data.obs || '', 
                JSON.stringify(data.abastecimentos || []), data.submetidoPor
            ]];

            await sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: 'DB_Logbook!A:A',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: { values: logbookValues },
            });

            // B. Gravar Recibos de Combustível (se existirem)
            if (data.abastecimentos && data.abastecimentos.length > 0) {
                const fuelValues = data.abastecimentos.map(f => [
                    timestamp, data.viatura, data.provincia, data.motorista,
                    f.litros, f.precoPorLitro, f.custoTotal, data.submetidoPor
                ]);

                await sheets.spreadsheets.values.append({
                    spreadsheetId: spreadsheetId,
                    range: 'DB_Fuel!A:A',
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    requestBody: { values: fuelValues },
                });
            }
            
            return res.status(200).json({ status: 'success', message: 'Logbook e Combustível gravados.' });
        }

        // ==========================================
        // ROTA 2: MANUTENÇÃO
        // ==========================================
        else if (data.action === 'maintenance') {
            const maintValues = [[
                timestamp, data.viatura, data.tipo, data.km, 
                data.custo, data.proxima, data.submetidoPor
            ]];

            await sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: 'DB_maintenance!A:A',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: { values: maintValues },
            });

            return res.status(200).json({ status: 'success', message: 'Manutenção gravada.' });
        }

        // ==========================================
        // ROTA 3: INCIDENTES / OCORRÊNCIAS
        // ==========================================
        else if (data.action === 'incident') {
            const incidentValues = [[
                timestamp, data.provincia, data.viatura, data.tipo, 
                data.gravidade, data.localizacao, data.descricao, data.foto, 
                data.submetidoPor, data.motorista
            ]];

            await sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: 'DB_incidents!A:A',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: { values: incidentValues },
            });

            return res.status(200).json({ status: 'success', message: 'Ocorrência gravada.' });
        }

        // AÇÃO INVÁLIDA
        else {
            return res.status(400).json({ status: 'error', message: 'Ação não reconhecida pelo servidor.' });
        }

    } catch (error) {
        console.error('Erro na operação Vercel:', error);
        return res.status(500).json({ status: 'error', message: 'Erro interno de servidor.' });
    }
}
