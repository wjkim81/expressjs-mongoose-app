var crypto = require('crypto');

var current_date = (new Date()).valueOf().toString();
var random = Math.random().toString();
var hashKey = crypto.createHash('sha1').update(current_date + random).digest('hex');

console.log(hashKey);
console.log(hashKey.length);

for (var i = 0; i < 10000; i++) {
  var id = crypto.randomBytes(5).toString('hex');
  console.log(id);
  console.log(id.length);
}
