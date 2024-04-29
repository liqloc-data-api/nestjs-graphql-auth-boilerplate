const { compilerOptions } = require('./tsconfig.json');
const { register } = require('tsconfig-paths');

const baseUrl = './dist'; // This should match the "baseUrl" in your tsconfig.json file.
register({
    baseUrl,
    paths: compilerOptions.paths,
});