#!/usr/bin/env node --harmony
const program = require('commander')
const util = require('./util')
const formats = require('../formats')
const specConverter = require('../../index')
const urlHelper = require('../../lib/utils/url')

let from = formats.AUTO
let to = formats.RAML10
let validate = false
let file = undefined
let options = {'validate': validate}

program
  .arguments('<file>')
  .option('-f, --from <from>', 'the from/input spec, valid values are: swagger, raml08, raml10 and auto (default)')
  .option('-t, --to <to>', 'the to/target spec, valid values are: swagger, raml08 and raml10 (default)')
  .option('-v, --validate <validate>', 'true to validate the output (defaults to false)')
  .action(f => {
    file = f
    if (typeof program.from !== 'undefined') {
      from = formats[program.from.toUpperCase()]
      if (typeof from === 'undefined') util.exit('Invalid --from spec given. See --help.')
    }
    if (typeof program.to !== 'undefined') {
      to = formats[program.to.toUpperCase()]
      if (typeof to === 'undefined') util.exit('Invalid --to spec given. See --help.')
    }
    if (typeof program.validate !== 'undefined') {
      validate = program.validate
    }
  })
  .parse(process.argv)

if (typeof file === 'undefined') util.exit('File path required. See --help.')

if (urlHelper.isURL(file)) {
  options['httpResolver'] = {
    getResource: function(path){
      return {'errorMessage': 'Method not allowed for URL ' + path + ' , only getResourceAsync'};
    },
    getResourceAsync: function(path){
      return new Promise(function(resolve, reject){
        urlHelper.get(path).then(function(response){
          resolve({content: response});
        }).catch(function(error) {
          reject({'errorMessage':'Error getting ' + path, 'error': error});
        });
      });
    }
  };
}

const converter = new specConverter.Converter(from, to)
converter.convertFile(file, options).then(result =>
  console.log(util.stringify(result))
).catch(util.exit)
