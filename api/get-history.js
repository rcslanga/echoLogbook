import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read A..N so we include Província (I) and Abastecimentos (N)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'DB_Logbook!A2:N',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(200).json({ status: 'success', history: [] });
    }

    // Column indices (0-based) from your screenshot
    const COL = {
      TIMESTAMP: 0,       // A - Data de Registo
      MOTORISTA: 1,       // B
      VIATURA: 2,         // C
      PARTIDA: 3,         // D
      CHEGADA: 4,         // E
      KM_INICIAL: 5,      // F
      KM_FINAL: 6,        // G
      TASK_CODE: 7,       // H
      PROVINCIA: 8,       // I - Provincia
      ABASTECIMENTOS: 13, // N - Abastecimentos (JSON string)
    };

    const recentRows = rows.slice(-10).reverse();

    const history = recentRows.map((row) => ({
      Timestamp: row[COL.TIMESTAMP] || '',
      Motorista: row[COL.MOTORISTA] || '',
      Viatura: row[COL.VIATURA] || '',
      Partida: row[COL.PARTIDA] || '',
      Chegada: row[COL.CHEGADA] || '',
      'KM Inicial': row[COL.KM_INICIAL] || '0',
      'KM Final': row[COL.KM_FINAL] || '0',
      'Província': row[COL.PROVINCIA] || '',
      Abastecimentos: row[COL.ABASTECIMENTOS] || '[]',
    }));

    return res.status(200).json({ status: 'success', history });
  } catch (error) {
    console.error('Erro no Histórico:', error);
    return res
      .status(500)
      .json({ status: 'error', message: error.message });
  }
}
