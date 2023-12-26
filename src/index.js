const {program} = require('commander');
const {Client} = require('./client')

program
    .option('-d, --download', 'download a file')
    .option('-i, --initialize', 'initialize a file')
    .option('-p --path <path>', 'destination for json files')
    .option('-sid --sheet-id <sheet-id>', 'ID of google spreadsheet')
    .option('-sec --secret <client-secret>', 'source of config')

program.parse();

const options = program.opts();
console.log(options);


(async function () {
    const client = new Client(options)

    if (options.download) {
        await client.download()
    } else if (options.initialize) {
        await client.initialize()
    }

})().then()


// client.initialize().then()
