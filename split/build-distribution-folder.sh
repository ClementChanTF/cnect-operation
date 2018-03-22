npx babel src --out-dir dist
cp package.json dist
cp .env.sample dist/.env
cp README.md.dist dist/README.md
cp docs/split-bulb-move-script.docx dist