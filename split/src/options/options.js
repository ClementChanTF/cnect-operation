'use strict';
process.version;

let ver = parseInt(process.version.split('.')[0].replace('v', ''), 10);
if (ver < 6) {
    console.log(` split must be running on node version 6 and later`);
    process.exit(0);
}


if (process.argv.length <= 2) {
    console.log(`
USAGE
 split would split a roll.csv into roll_split.csv for block:product in
 1:1 relationship, m:1 relationship and m:m relationship.

 output:
    if single pair start_tag, end_tag is provided, output to go to <file>_split.csv
    if many_to_many is specified with single pair of start_tag and end_tag, output will go to <file>_split_<starttag>.csv
    if many_to_many is specified with multiple pairs of start_tag and end_tag, output will go to 
        <file>_split_<starttag0>.csv
        <file>_split_<starttag1>.csv
            ...
        <file>_split_<starttagn>.csv
        
    if product_id or product_name is provided, the single pair or list of start_tags and eng_tags will be verified that
        they actually exist in the database and product is their currently parent before splitting occurs.
        
    Terminal console will display the output filename following by
     the tag UID count 
        <csv_filepath>_split.csv, 500 
        or 
        <csv_filepath>_split_<tag uid 1>.csv, 500
        <csv_filepath>_split_<tag uid 2>.csv, 500
        ...

 arguments:

  --csv_filepath - linux based relative or absolute file path, not HTTP rest API
  --start_tag - single Tag UID or comma seperate list of Tag UIDs i.e. tag0,tag1,tag2,tag3
  --end_tag - singleTag UID or comma seperate list of Tag UIDs tag0,tag1,tag2,tag3  must match the same count as start_tags
  --many_to_many - default is no, all block(s) will go into <file>_split.csv
                   if specified, it will go into one or more files with roll_split_starttag[0n].csv
  --product_id - parent product ID i.e. 5063114bd386d8fadbd6b004
  --product_name - parent product name i.e. "Bedford Industries Inc"; use begin and ending quote 
                   to group long product name with spaces.
  --uid_file - contains start,end pairs (TBD currently not supported)


 notes:

  supports only node version 6 or later

`);
    process.exit(0);
}

let csv_filepath;
let start_tag;
let end_tag;
let many_to_many;
let parent_product;
let uid_file;
let product_id;
let product_name;

for (let j = 2; j < process.argv.length; j++) {
    //console.log(j + ': ' + (process.argv[j]));
    let options = (process.argv[j].split("="));
    let key = options[0];
    let value = options[1];
    switch (key) {
        case "--csv_filepath":
            csv_filepath = value || '';
            break;
        case "--start_tag":
            start_tag = value || '';
            break;
        case "--end_tag":
            end_tag = value || '';
            break;
        case "--many_to_many":
            many_to_many = value || '';
            break;
        case "--uid_file":
            uid_file = value || '';
            break;
        case "--product_name":
            product_name = value.replace(/^["']/, '').replace(/["']$/, '') || '';
            break;
        case "--product_id":
            product_id = value || '';
            break;
        default:
            break;
    }
}
/*
  remove trailing commas
 */
start_tag = start_tag.replace(/,$/, '');
end_tag = end_tag.replace(/,$/, '');

module.exports = { csv_filepath, start_tag, end_tag, many_to_many, parent_product, uid_file, product_id, product_name }

// console.log(`csv_filepath ${csv_filepath}`);
// console.log(`start_tag ${start_tag}`);
// console.log(`end_tag ${end_tag}`);
// console.log(`many_to_many ${many_to_many}`); 
// console.log(`parent_product ${parent_product}`);
// console.log(`uid_file ${uid_file}`);