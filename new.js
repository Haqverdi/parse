var tress = require('tress');
var needle = require('needle');
var cheerio = require('cheerio');
var resolve = require('url').resolve;
var fs = require('fs');

var URL = ['https://news.day.az/politics/985095.html','https://news.day.az/politics/985253.html'];
var results = [];

var q = tress(function(url, callback){
    needle.get(url, function(err, res){
        if (err) throw err;

        var $ = cheerio.load(res.body);

            results.push({
                title: $('h1.caption').text(),
                text: $('div.description').text(),
                date: $('div.sharepost').next().children().children().text(),
                href: url,
                size: $('div.description').text().length
            });
            console.log('done');
        callback();
    });
});

q.drain = function(){
    fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
}
q.push(URL);