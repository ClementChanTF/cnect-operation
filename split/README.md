# Thinfilm Operation Script 

## Name: Split / Bulb Move

## Requirements
  * NodeJS version 8+
  * MongoDB version 3.4+
  * linux/mac console terminal
    
## Installation
- clone project
- `cd cnect-operation/split`
- run `npm run dist` to create dist package for deployment

## Environment variables
Environment variables are listed in `.env.sample` template file in project root.

## Scripts
Scripts can be run with `node`. 

Script constains usage, and be shown by running script without arguments.

```
cd ./dist
```

```
node split.js <...arguments>
```

environment variables string are set in .env


## Manual guide
1. Run `node split.js` with arguments
2. See console output for \*\_split_*.csv output files file path and tags count
3. Suggested dev use cases can be found in .vscode/launch.json
4. Compress ./dist folder into dist.zip for ease of deployment
5. See docs/split-bulb-move-script.docx for detailed descriptions