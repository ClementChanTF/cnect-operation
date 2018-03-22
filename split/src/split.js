'use strict';
let fs = require('fs');
let path = require('path');
let options = require('./options/options');
const { isEmpty, isOfSameLength, hasSingleElement,
  isInteger, isIdentical, getIntervalNode,
  processStartEndRange, processOverlapRange } = require('./buffer/proper');
const { success_file_status } = require('./templates/status-text');
const { validateParentProduct, isProductIdDefined } = require('./mclient/data-source');

let { csv_filepath } = options;

const main = async (options) => {
  return new Promise((resolve, reject) => {
    try {
      var result = fs.readFileSync(csv_filepath).toString().split("\n");
      result = result.map(line => line.trim());
      return resolve({ result, options })
    } catch (error) {
      return reject(`error: reading file ${JSON.stringify(error, null, 2)}`);
    }
  })
}
const reduceToOneBuffer = (array, { key }) => {
  return array.reduce((accum, item, index) => {
    let newAccum = [...accum, ...item[key]]
    return newAccum;
  }, []);
}
const writeOutput = async (resolveObject) => {
  return new Promise((resolve, reject) => {
    let { result, options, properPairs } = resolveObject;
    let { many_to_many } = options;
    let exit_status;

    let { name, ext, dir } = path.parse(csv_filepath);

    if (hasSingleElement(properPairs)) {
      /*
        Split 1:1, [single]:1
       */
      let singleBuffer = reduceToOneBuffer(properPairs, { key: 'block' });

      // write to <input>_split.csv
      let suffix = many_to_many ? `_${properPairs[0].stag.uid}${ext}` : `_split${ext}`;
      let output_file_name = `${dir}/${name}${suffix}`;

      try {
        let bytes = fs.writeFileSync(output_file_name, singleBuffer.join("\n"));
        let proper_start_tag = properPairs[0].stag.uid;
        let proper_end_tag = properPairs[0].etag.uid;
        // resolve(`block from ${proper_start_tag} to ${proper_start_tag} saved in ${output_file_name}`);
        exit_status = success_file_status(output_file_name, singleBuffer);
        return resolve({ exit_status });
      } catch (error) {
        return reject(`failed to write buffer in ${output_file_name} due to ${JSON.stringify(error, null, 2)}`);
      }

    } else {
      let exit_status
      if (typeof many_to_many === "undefined") {
        // split with multiple blocks (m:1)
        let singleBuffer = reduceToOneBuffer(properPairs, { key: 'block' });

        try {
          let output_file_name = `${dir}/${name}_split${ext}`;
          let bytes = fs.writeFileSync(output_file_name, singleBuffer.join("\n"));
          let sUID = properPairs[0].stag.uid;
          let eUID = properPairs[0].etag.uid;
          // resolve(`block from ${sUID} to ${eUID} saved in ${output_file_name}`);
          exit_status = success_file_status(output_file_name, singleBuffer);
          return resolve({ exit_status });
        } catch (error) {
          return reject(`failed to write buffer in ${output_file_name} due to ${JSON.stringify(error, null, 2)}`);
        }
      } else {
        /*
           bulb move (m:m)
         */
        exit_status = '';
        properPairs.forEach((pair) => {
          let singleBuffer = [...pair.block];
          try {
            let sUID = pair.stag.uid;
            let eUID = pair.etag.uid;
            let output_file_name = `${dir}/${name}_split_${sUID}${ext}`;
            let bytes = fs.writeFileSync(output_file_name, singleBuffer.join("\n"));
            exit_status += success_file_status(output_file_name, singleBuffer);
            
          } catch (error) {
            return reject(`failed to write buffer in ${output_file_name} due to ${JSON.stringify(error, null, 2)}`);
          }
        });
        return resolve({ exit_status });
      }
    }
  })
}

main(options)
  .then(processStartEndRange)
  .then(processOverlapRange)
  .then(validateParentProduct)
  .then(r => {
      // presence of product_id meant, user requested database validation 
      let { product_id, inclusiveStatus, splitError, options } = r;
      // if (typeof product_id === "undefined" && typeof options.product_id === "undefined")
      //   return r;
      if (!isProductIdDefined(r))
        return r;

      if (inclusiveStatus == true)
        return r;
      else 
        throw new Error(`input split block from "${r.product_name}" can not be validated against the database record, ${r.splitError}!`);
      // debugger;
  })
  .then(writeOutput)
  .then(r => {
    console.log(r.exit_status);
    process.exit(0)
  })
  .catch(error => {
    console.log(`${error}
` );
  process.exit(-1);
});