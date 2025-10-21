const { writeFile } = require('fs/promises');

async function writeToFile(fileName, data) {
  try {
    await writeFile(fileName, data);

    console.log(`Wrote data to ${fileName}`);
  } catch (error) {
    console.error(`Got an error trying to write the file: ${error.message}`);
  }
}
function logger(req, res, next){
    const method=req.method;
    const url=req.url;
    const time=new Date().getFullYear();
    console.log(method,url,time);
   writeToFile('friends.txt', method+" "+url+" "+time);
     next();
}
module.exports=logger;