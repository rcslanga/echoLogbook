import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Lê a folha DB_Incidents (A..J conforme o screenshot)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'DB_Incidents!A2:J',
    });

    const rows = response.data.values || [];

    const incidents = rows.map((row) => ({
      Timestamp: row[0] || '',
      Provincia: row[1] || '',
      Viatura: row[2] || '',
      TipoOcorrencia: row[3] || '',
      Gravidade: row[4] || '',
      Localizacao: row[5] || '',
      Descricao: row[6] || '',
      Foto: row[7] || '',
      SubmetidoPor: row[8] || '',
      Motorista: row[9] || '',
    }));

    return res.status(200).json({
      status: 'success',
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error('Erro em get-incidents:', error);
    return res
      .status(500)
      .json({ status: 'error', message: error.message });
  }
}
