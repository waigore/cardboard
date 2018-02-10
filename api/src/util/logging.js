const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const moment = require('moment');

const tsFormat = () => moment().format('YYYY-MM-DD hh:mm:ss').trim();

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

module.exports = {
  getLogPath: function() {
    return './logs';
  },

  getRootLogger: function(prefix) {
    return this.getLogger('cardboard', prefix, 'info', true);
  },

  getLogger: function(name, prefix, level='info', stdout=true) {
    let myTransports = [];
    if (stdout) {
      myTransports.push(new transports.Console({
        colorize: true
      }));
    }

    let logPath = this.getLogPath();
    myTransports.push(new transports.File({
      filename: `${logPath}/${name}.log`
    }));

    let logger = createLogger({
      level: level,
      transports: myTransports,
      format: combine(
        label({ label: prefix }),
        timestamp(),
        myFormat
      ),
    })

    return logger;
  }
}
