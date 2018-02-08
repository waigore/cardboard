const fs = require('fs');
const archiver = require('archiver');

module.exports = {
  writeZipFile: function(fileList, outStream) {
    let archive = archiver('zip', {
      zlib: { level: 9 }
    });

    outStream.on('end', function() {
      console.log('Data has been drained');
    });

    archive.pipe(outStream);

    fileList.forEach(file => {
      archive.append(fs.createReadStream(file.fullPath), {name: file.identifier + "_" + file.filename})
    })

    archive.finalize();
  }
}
