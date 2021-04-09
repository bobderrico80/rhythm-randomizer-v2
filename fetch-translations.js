require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const logger = console;

const {
  GOOGLE_PROJECT_ID,
  GOOGLE_PRIVATE_KEY_ID,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_CLIENT_EMAIL,
  GOOGLE_CLIENT_ID,
  GOOGLE_TRANSLATION_SPREADSHEET_ID,
} = process.env;

const SPREADSHEET_RANGE = 'translations!A:C';

(async () => {
  logger.info('Fetching translations...');
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: GOOGLE_PROJECT_ID,
        private_key_id: GOOGLE_PRIVATE_KEY_ID,
        private_key: GOOGLE_PRIVATE_KEY,
        client_email: GOOGLE_CLIENT_EMAIL,
        client_id: GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
          'https://www.googleapis.com/robot/v1/metadata/x509/translation-retrieve%40rhythm-randomizer.iam.gserviceaccount.com',
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_TRANSLATION_SPREADSHEET_ID,
      range: SPREADSHEET_RANGE,
    });

    const sheet = res.data.values;

    const headerRow = sheet.shift();

    const terms = sheet.reduce((previousTerms, [term]) => {
      return [...previousTerms, term];
    }, []);

    const languages = headerRow.slice(1);

    const languageObjects = {};

    languages.forEach((language, languageIndex) => {
      const languageObject = {};
      terms.forEach((term, termIndex) => {
        languageObject[term] = sheet[termIndex][languageIndex + 1];
      });

      languageObjects[language] = languageObject;
    });

    Object.entries(languageObjects).forEach(([language, languageObject]) => {
      const translationPath = path.resolve(
        __dirname,
        `public/locales/${language}`
      );

      if (!fs.existsSync(translationPath)) {
        fs.mkdirSync(translationPath);
      }

      logger.info(`Writing translations file for ${language}`);
      fs.writeFileSync(
        path.resolve(__dirname, `public/locales/${language}/translation.json`),
        JSON.stringify(languageObject),
        'utf-8'
      );
    });
    logger.info('Translations fetched!');
  } catch (error) {
    logger.error('Error fetching translations!', error);
    process.exit(1);
  }
})();
