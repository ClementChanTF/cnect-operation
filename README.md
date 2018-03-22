# Thinfilm Operation Script 

## Requirements
  * NodeJS version 8+
  * MongoDB version 3.4+
  * linux/mac console terminal
    
## Installation
- clone project
- `cd /tf-standalone-script/<FOLDER>`
- install additional modules via `npm install` from project root
- create `.env` file with environment variables

## Environment variables
Environment variables are listed in `.env.sample` template file in project root.

## Scripts
Scripts can be run with `node`. Scripts should contain usage.
```
<ENV> node split/src/split.js <...arguments>
```

Where `<ENV>` is environment variables string, e.g.
```
DATABASE_URI=mongodb://127.0.0.1/test node src/split.js --csv_file_path=file.csv ...
```

## Manual translation guide
1. Run `node ./src/<SCRIPT>.js` with arguments, see docs for reference of arguments
2. Run `node ./src/<SCRIPT>.js` with arguments, see docs for reference of arguments
3. Suggested dev use cases may be found in .vscode/launch.json

