const fs = require('fs');
const path = require('path');
const converter = require('openapi-to-postmanv2');

const openApiFile = path.resolve(process.cwd(), './swagger.json'); // prefer JSON
const outputFile = path.resolve(process.cwd(), './postman_collection.json');

function ensureSwaggerJson() {
  if (fs.existsSync(openApiFile)) {
    return fs.readFileSync(openApiFile, 'utf8');
  }

  const swaggerConfigPath = path.resolve(process.cwd(), './config/swagger.js');
  if (!fs.existsSync(swaggerConfigPath)) {
    throw new Error('swagger.json not found and config/swagger.js does not exist');
  }

  const swaggerSpec = require(swaggerConfigPath);

  const json = JSON.stringify(swaggerSpec, null, 2);
  fs.writeFileSync(openApiFile, json, 'utf8');
  console.log('ℹ️  Generated', openApiFile, 'from config/swagger.js');
  return json;
}

try {
  const openApiData = ensureSwaggerJson();

  converter.convert(
    { type: 'json', data: openApiData },
    {},
    (err, conversionResult) => {
      if (err) {
        console.error('❌ Error:', err);
        return;
      }

      if (!conversionResult.result) {
        console.error('❌ Conversion failed:', conversionResult.reason);
        return;
      }

      fs.writeFileSync(outputFile, JSON.stringify(conversionResult.output[0].data, null, 2));
      console.log('✅ Postman collection generated:', outputFile);
    }
  );
} catch (error) {
  console.error('❌ Failed to generate Postman collection:', error.message || error);
  process.exit(1);
}
