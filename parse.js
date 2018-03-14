var tress = require('tress');
var needle = require('needle');
var cheerio = require('cheerio');
var resolve = require('url').resolve;
var fs = require('fs');


var base_url = 'https://ofigenno.com/';
//Deyishmek olmaz
var URL = ['https://ofigenno.com/tayny-sovetskih-filmov'];
//Parse etmeye bashladigimiz sehife
var end_link = 'https://ofigenno.com/krasivaya-doch-eminema';
//sonuncu parse edeciyimiz sehife
//eger hamisiniz parse etmek isteseniz - end_link = base_url yazmaq olar

var results = [];
var counter = 1;
var q = tress(function(url, callback){
    needle.get(url, function(err, res){
        if (err) throw err;

        var $ = cheerio.load(res.body);
            var ptext = [];
            $('#article>p').each(function(){
              ptext.push(
                $(this).text()
              );
            });
            var img_url = [];

            if ($('#article>div').hasClass('instagram-media-box')) {
              $('#article > div.instagram-media-box > iframe').each(function(){
                img_url.push(
                  $(this).attr('src')
                );
              });
            } else {
              $('#article>div>img').each(function(){
                img_url.push(
                  resolve(base_url, $(this).attr('src'))
                );
              });
            }

            results.push({
                title: $('h1').text(),
                text: ptext,
                href: url,
                img_urls: img_url
            });
            var link = resolve(base_url, $('.next-post>a').attr('href'))
            console.log("Number of parsed records: " + counter++);

            // console.log(link2);
            if (link != end_link) {
              q.push(link);
            }
        callback();
    });

}, 20);

q.drain = function(){
    fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
}
q.push(URL);
