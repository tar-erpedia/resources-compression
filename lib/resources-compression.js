const sharp = require('sharp');
const prompts = require('prompts');
const fs = require('fs');
const fse = require('fs-extra');
const path = require("path");
const glob = require('glob');

const WEBP = '1';
const AVIF = '2';
const BOTH = '3';

const cmdGreen = '\x1b[32m%s\x1b[0m';
const cmdYellow = '\x1b[33m%s\x1b[0m';
const cmdRed = '\x1b[31m%s\x1b[0m';

const defaultNewFolderName = 'compressedResources';

var questions = [
    {
        type: 'text',
        name: 'format',
        message: 'webp - 1,  avif - 2, both - 3',
        validate: value => (value < 1 || value > 3 ? `Must enter a proper number :)` : true)
    },
    {
        type: 'number',
        name: 'quality',
        message: 'Quality',
        initial: '75',
        min: 1,
        max: 100
    },
    {
        type: 'text',
        name: 'parentPath',
        message: 'Enter resource path',
        initial: process.cwd()
    }
];

(async () => {
    var response = await prompts(questions);
    const format = response.format;
    const quality = response.quality;
    const parentPath = response.parentPath;
    var valuesNotEmpty;

    valuesNotEmpty = async function() {
        if (!format || !quality || !parentPath) {
            console.log(cmdRed, `You have terminated the program...`);
            process.exit();
        }
    }

    await valuesNotEmpty();

    questions = [
        {
            type: 'text',
            name: 'destPath',
            message: 'Enter destination path',
            initial: path.resolve(parentPath, '..', defaultNewFolderName),
        },
        {
            type: 'confirm',
            name: 'keepOrg',
            message: 'Do you want to keep the original resource in the destination folder?',
            initial: false
        }
    ]

    response = await prompts(questions);
    const destPath = response.destPath;
    const keepOrg = response.keepOrg;

    valuesNotEmpty = async function() {
        if (!destPath || keepOrg == null) {
            
            console.log(cmdRed, `You have terminated the program...`);
            process.exit();
        }
    }

    await valuesNotEmpty();

    // Create the destination folder
    try {
        function syncIsFolderEmpty(path) {
            return fs.readdirSync(path).length === 0;
        }

        async function createFolder() {
            if (fs.existsSync(destPath)) {
                if (!syncIsFolderEmpty(destPath)) {
                    console.log(cmdYellow, `The program has to override the folder in the given path, if you wont agree, the program will terminate itself`);
                    var isOverride = await prompts({
                        type: 'confirm',
                        name: 'override',
                        message: 'Override?',
                        initial: false
                    });

                    if (isOverride.override) {
                        fse.emptyDirSync(destPath);
                    } else {
                        console.log(cmdRed, `the program is being terminated...`);
                        process.exit();
                    }
                }
            } else {
                fs.mkdirSync(destPath);
            }
        }

        await createFolder();

        // Either path didnt exist / user confirmed to override - copying former folder to a new path
        fse.copySync(parentPath, destPath);
        console.log(cmdYellow, `compressed files path: ${destPath}`);
    } catch (err) {
        console.error(err)
    }

    try {
        console.log(cmdGreen, 'Starting to compress the resources');

        // Get all compressions
        async function compressFiles(destPath) {
            const allCompressions = [];

            const files = glob.sync(`${destPath}/**/*.*`);

            files.forEach(function (filePath) {
                const fileName = path.basename(filePath);
                const fileWithoutType = fileName.split('.')[0];
                const newPath = path.join(path.dirname(filePath), fileWithoutType);

                if (format == WEBP || format == BOTH) {
                    const compression = sharp(filePath)
                        .webp({ quality: quality, reductionEffort: 6 })
                        .toFile(`${newPath}.webp`)
                        .then(() => {
                            if (!keepOrg) {
                                fse.removeSync(filePath);
                            }
                        })
                        .catch(err => console.log(cmdRed, `In webp format - ${err} : ${fileName}`))
                    allCompressions.push(compression);
                }

                if (format == AVIF || format == BOTH) {
                    const compression = sharp(filePath)
                        .avif({ quality: quality, speed: 0 })
                        .toFile(`${newPath}.avif`)
                        .then(() => {
                            if (!keepOrg) {
                                fse.removeSync(filePath);
                            }
                        })
                        .catch(err => console.log(cmdRed, `In avif format - ${err} : ${fileName}`))
                    allCompressions.push(compression);
                }
            })

            return allCompressions;
        }

        // Made jobs so all the compressions will run simultaneously
        const jobs = await compressFiles(destPath);
        await Promise.all(jobs);

        console.log(cmdGreen, 'Compression finished');

    } catch (err) {
        console.log(err);
    }
})()