//Parse olunmush melumatlari Json-dan bazaya yuklemek ucun konsolda 'node sendtodb.js' yazmaginiz kifayetdir.
let mysql = require(`mysql`);
let jsonfile = require(`jsonfile`)
let file = `./data.json`;

let con = mysql.createConnection({
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
  let c = 1;
  for (let i = 0; i < results.length; i++) {
  let textp  = results[i].text.toString();
  let new_text = textp.replace(/'/g, "-");
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
