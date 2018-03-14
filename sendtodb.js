//Parse olunmush melumatlari Json-dan bazaya yuklemek ucun konsolda 'node sendtodb.js' yazmaginiz kifayetdir.
var mysql = require(`mysql`);
var jsonfile = require(`jsonfile`)
var file = `./data.json`;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ofigenno"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

jsonfile.readFile(file, function(err, results) {
  var c = 1;
  for (var i = 0; i < results.length; i++) {
  var textp  = results[i].text.toString();
  var new_text = textp.replace(/'/g, "-");
  sql = "INSERT INTO `news` (`ID`, `Title`, `Text`, `Url`, `Images`) VALUES (NULL, " + "'" + results[i].title + "', '" + new_text + "', '" + results[i].href + "', '" + results[i].img_urls + "');"
  con.query(sql, function (err, result) {
  if (err) throw err;
  console.log(result.message + "Number of records inserted: " + c++);
  });
  }
  if (i = results.length - 1) {
    console.log('Done!');
    con.end();
  }
});
