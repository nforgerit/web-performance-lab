const schema = require('schm')

// baseline monitoring, schedule every hour: intervalTimespan=3600
// special monitoring for 1 month, schedule every 10min: repeatUntil=+1m intervalTimespan=600
module.exports = schema({  
  intervalTimespan: String, // scheduled timespan between two calls (unit is 'seconds')
  repeatUntil: String, // don't run the scheduled job anytime after this deadline
})
