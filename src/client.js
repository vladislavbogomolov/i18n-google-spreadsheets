const {GoogleSpreadsheet} = require('google-spreadsheet');
const {JWT} = require('google-auth-library');
const config = require('../google-secret.json')
const fs = require("fs");
const path = require('path');
const glob = require("node:glob");

class Client {

    constructor(option) {

        this.path = option.path ?? './translations'

        const serviceAccountAuth = new JWT({
            email: config.client_email,
            key: config.private_key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        this.doc = new GoogleSpreadsheet(option.sheetId, serviceAccountAuth);

    }


    async initialize() {

        await this.doc.loadInfo()

        await this.doc.updateProperties({title: 'i18n-google-spreadsheet'})

        const common = this.doc.sheetsByIndex.find(doc => doc.title === 'common')

        if (!common) {
            const newSheet = await this.doc.addSheet({title: 'common', headerValues: ['key', 'en', 'it']})
            await newSheet.addRow({key: 'hello', en: 'hello', it: 'ciao'});
        }

    }

    async download() {

        await this.doc.loadInfo()

        const newObject = {};

        for (const doc of this.doc.sheetsByIndex) {

            const rows = await doc.getRows();

            const languages = doc.headerValues.filter((header) => header !== 'key');

            newObject[doc.title] = {}

            for (const lang of languages) {

                newObject[doc.title][lang] = {};

                for (const row of rows) {
                    newObject[doc.title][lang][row.get('key')] = row.get(lang);
                }

                fs.mkdirSync(`${this.path}/${lang}`, {recursive: true});

                await fs.promises.writeFile(`${this.path}/${lang}/${doc.title}.json`, JSON.stringify(newObject[doc.title][lang]));

            }

        }

    }

    async addNewKeys() {

        const NewTranslations = [];

        glob.sync('./**/*.tsx').map((file) => {
            // reading html file
            const readFile = fs.readFileSync(file, {encoding: 'utf8'});
            const x = readFile.match(/(?<={t\(')(.*)(?=\'\))/g);
            if (x) {
                x.forEach((val) => {
                    if (!NewTranslations.includes(val)) {
                        NewTranslations.push(val);
                    }
                });
            }
        });

        console.log(NewTranslations)

    }


}

exports.Client = Client;
