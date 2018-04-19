//ilk defe (0-dan) parse ucun..
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');
const download = require('download');
const mkdirp = require('mkdirp');
const mysql = require(`mysql`);
var schedule = require('node-schedule');

var con = mysql.createConnection({//bazaya connect
    host: "144.76.61.53",
    user: "temalist",
    password: "luR7LkAwyA5u4OyQ8ZSl",
    database: "temalist"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");//db-ye qoshulma haqqinda bildirish
});
let page = 2;
//birinci parse edeciyimiz sehife
var start_url = 'https://ofigenno.com';
//sonuncu parse edeciyimiz sehife - 1
var end_url = 'https://ofigenno.com/page-'+`${page}`;

// var j = schedule.scheduleJob('*/10 * * * *', function(){
//   console.log(new Date().toLocaleString());

let query = con.query('SELECT `ID`,`add_time`, `news_date` FROM `news2` order by ID desc limit 1'); //en son elave edilmish melumatin ID ve elave edilme tarixini aliriq
query.on('result', function(row) {
    console.log(row.news_date + ' ' + row.ID);
let check = row.add_time; //en son elave edilmish melumatin elave edilme tarixi
var w = tress(work); //parse olunmush bashliqlarin her birinin parse olunmasi ucun ardicil olaraq siraya qoyularaq parse olunmasi
w.drain = done; //siraya qoyulmush postlar parse edildikden sonra edilecek ish
var results = []; //parse olunmush postlara aid melumatlarin yazilmasi ucun massiv
if (row.ID == undefined) {
    var counter2 = (page - 1)*15; //en son parse olunmush ve bazaya yazilmish melumatin id-den bashlayaraq folder ve shekil adlarinin formalashdirilmasi ucun counter
    var counter3 = (page - 1)*15;
} else {
    counter2 = row.ID + (page - 1)*15;
    counter3 = row.ID + (page - 1)*15;
}
var headers = [];//bashliqlar uzre parse olunmush melumatlari bazaya yazilana qeder muveqqeti saxlamaq ucun array
var checking = true;//en son melumatin tarixini yoxlanilmasi ucun check-er
var q = tress(function(url, callback){
    needle.get(url, function(err, res){
        if (err) throw err;
        var $ = cheerio.load(res.body, { decodeEntities: false, normalizeWhitespace: true });//parse olunmush html kodun emal olunmasi ucun cheerio load edilmesi
        $('div#blog>div.post').each(function(p,elem){ //bir sehifede olan bashliqlarin her birinden lazimi melumatlari goturmek ucun foreach
            var added_time = $(this).find('div.post-content>div.post-note>div.calendar>span').text();//Postun (bashliginda olan) elave olunma tarixi

            // if (check != undefined && added_time === check) {//parse edilen bashligin elave olunma tarixine gore en son saxladigimiz bashligdan sonra elave olundugunu yoxlamaq ucun
            //     checking = false; //eger yeni info yoxdursa parse saxlamag ucun chekerin false edilmesi
            //    //eger yeni post yoxdursa bu barede consolda bildirish
            //     console.log('After ' + added_time + ' no news to Add');
            // }
            if (checking) {//eger parse olunan bashliq yenidirse siraya elave edilmesi
                var thum_img = resolve(start_url, $(this).find('.post-thumb>a>img').attr('src'));//cover shekilinin yuklenilmesi ucun onun linki
                var thum_header = $(this).find('div.post-content>div.post-header>a>h2').text().replace(/\n/g, "").replace(/\t/g, "").replace(/\\/g, "").replace(/"/g, "'").replace(/�/g, "");//xeberin title-i
                var thum_desc = $(this).find('div.post-content>div.post-header>span.description').text().replace(/\n/g, "").replace(/\t/g, "").replace(/\\/g, "").replace(/"/g, "'").replace(/�/g, "");//bashliqin decriptionu
                var thum_cat = [];//bashligin categoriyalarinin yazilmasi array
                $(this).find('div.post-content>div.post-note>div.category>span>a').each(function(){ //her bir categoriyanin thum_cat massivine elave edilmesi
                    thum_cat.push($(this).text());
                });
                thum_cat_id = [];//categoriyalarin bazaya yazilmasi zamani nomrelenmesi ucun array
                for (let i = 0; i < thum_cat.length; i++) { //categoriyanin bazada olan gategoriya uzre hansina aid oldugunu mueyyen edilmesi
                    switch (thum_cat[i]) {
                      case 'Развлечения': thum_cat_id.push(1);
                        break;
                      case 'Жизнь': thum_cat_id.push(2);
                        break;
                      case 'Искусство': thum_cat_id.push(3);
                        break;
                      case 'Наука': thum_cat_id.push(4);
                          break;
                      case 'Природа': thum_cat_id.push(5);
                        break;
                      case 'Животные': thum_cat_id.push(6);
                        break;
                       case 'Видео': thum_cat_id.push(7);
                        break;
                      case 'Авто': thum_cat_id.push(8);
                        break;
                      case 'Технологии': thum_cat_id.push(9);
                        break;
                      case 'Економика': thum_cat_id.push(10);
                        break;
                      case 'Прокачай Мозг': thum_cat_id.push(11);
                        break;
                    }
                }
                let minlik = parseInt(((counter2 / 1000) + 1)) * 1000;
                let yuzluk = parseInt(((counter2 / 100) + 1)) * 100;
                mkdirp(`./photo/${minlik}/${yuzluk}/${counter2}`, function (err) {//her bir bashliq ucun folderin yaradilmasi
                    if (err) console.error(err)
                });
                download( `${thum_img}`, `./photo/${minlik}/${yuzluk}/${counter2}`).then(() => { //her bir bashliq shekilinin yuklenilmesi ona aid folder-e
                });
                headers.push({ //her bir bashliga aid melumatlarin headers massivinde bazaya yazilana qeder saxlanmasi ucun massive push edilmesi
                    header: thum_header,
                    desc: thum_desc,
                    img_src: `/photo/${minlik}/${yuzluk}/${counter2}/cover.${thum_img.split('.').pop()}`,
                    category_id: thum_cat_id,
                    add_time: added_time
                });
                w.push(resolve(start_url, $(this).find('div.post-content>div.post-header>a').attr('href')));
            } // end cheking if
            counter2--;       
        });
            //parse edilen zaman novbeti bashliqlar sehifesinin parse edilmesi ucun siraya qoyulmasi 
            var next_url = resolve(start_url, $('.navi-right>a').attr('href'));
            if (next_url != end_url) {
              q.push(next_url);
            }
        callback();
            //
    });

}, 15);//eyni zamanda bir nece potokun servere gonderilmesi
q.drain = function(){
    console.log('Headers recorded!!!');//bashliqlarin yazilmasi barede bildirish
}
q.push(start_url);//novbeti bashliqlar sehifenin siraya elave edilmesi

counter4 = 0;//parse olunmush bashliqlara aid melumatlarin bazaya yazilmasi ucun komekci counter
//work tress -- sirada olan parse edilecek postlarin parse edilmesi
function work(post, cb){
    needle.get(post, function(err, res){//sirada olan postlar uzre sorgunun gonderilmesi 
        if (err) throw err;
        let $ = cheerio.load(res.body, { decodeEntities: false });//body-inin cheerioya elave edilmesi
        let img_url = [];//posta olan shekillerin her birinin yuklenmesi ucun onlarin url-nin yigilmasi massiv
        //posta shekillerin ve ya videonun hansi tip oldugunu mueyyen edilmesi ve emal olunmasi
        $('#article>div').each(function(z, elems){
            if ($(this).hasClass('instagram-media-box') || $('#article>div').hasClass('video')) {
                $(this).html($.html($(this).find('iframe')));
                //eger iframe tegindedirse melumat
            } else if($(this).hasClass('photo')) {
                //posta olan shekillerin linklerinin Download-la yuklenmesi ucun massive elave eidlmesi
                img_url.push(resolve(start_url, $(this).find('img').attr('src')));
            }
        });
        if ($('#article>div').hasClass('ad intext')) {
            //eger shekilleri 'id intext' classli divin icindedirse onlarin img src-lerinin goturulmesi
            $('#article>div.ad.intext>div.photo>img').each(function(e, elem){
                img_url.push(
                  resolve(start_url, $(this).attr('src'))
                );
            });
        }
        let minlik = parseInt(((counter3 / 1000) + 1)) * 1000;
        let yuzluk = parseInt(((counter3 / 100) + 1)) * 100;        
        let path = []; // postun html strukturanda img-lerin src-nin deyishdirilmesi ucun yuklenmsih shekillerin path-lari
        for (let r = 1; r <= img_url.length; r++) {
            const element = `/photo/${minlik}/${yuzluk}/${counter3}/${r}.jpg`;
            path.push(element);
        }
        //yuklenmeli olan shekillerin yuklenmesi
        Promise.all(img_url.map(x => download(x, `./photo/${minlik}/${yuzluk}/${counter3}`))).then(() => { 
            console.log(w.length() + ' items waiting to be processed');
          });
          //eger posta olan shekiller 'id intext' classli divin icinde olsa onlarin emal olunmasi
        if ($('#article>div').hasClass('ad intext')) { 
            $('#article>div.ad.intext>div.photo>img').each(function(e, elem){
                $(this).attr('src', `${path[e]}`);
            });
        }
        $('#article>div.photo>img').each(function(t, elem){ //postun html-inde img-lerin src-nin yuklenmish shekillerin path-lari ile evez olunmasi
            $(this).attr('src', `${path[t]}`);
            $(this).addClass('img-responsive');
        })
        if($('#article>div').hasClass('ad intext')){ //'ad intext' classli divlerin postun html strukturandan silinmesi
            $('#article>div.ad').remove();
        }
        //js ile bagli lazimsiz script ve funksiyalarin silinmesi
        $('#article>div.photo>div.image-rollover-wrap').remove();
        $('#article>div.ad.intext>div.photo>div.image-rollover-wrap').remove();
        $('#article>div.ad.intext>div.photo').removeAttr('onmouseover').removeAttr('onmouseout').removeAttr('class');
        $('#article>div.photo').removeAttr('onmouseover').removeAttr('onmouseout').removeAttr('class');
        $('#article>div.clear').remove();
        $('#article>h1').remove();
        // postun hazir html-i
        let nhtml = $('#article').html().replace(/\n/g, "").replace(/\t/g, "").replace(/\\/g, "").replace(/�/g, "").replace(/<div>/g, "<p>").replace(/<\/div>/g, "</p>");
        //yazilmish her bir bashliq uzre ona aid melumatlarin results massivine yazilmasi
          results.push({
            header: headers[counter4].header,//Title
            desc: headers[counter4].desc,//Decription
            img_src: headers[counter4].img_src,//cover image src
            category_id: headers[counter4].category_id,//categriya array-i
            post_number: counter3,//postun nomresi , optional
            add_time: headers[counter4].add_time, // saytda olan elave olunma tarixi
            post: nhtml //postun hazir html-i
            });
        counter3--;//her bir postun ona aid foldere shekilerrin yuklenmsi ucun komekci counter
        counter4++;//her bir bashliga aid melumatlarin headers massivinde goturulmesi ucun komekci counter
    cb();
    });
}

function done(){//parse edilmish melumatlarin results massivinden bazaya yazilmasi
    console.log('Done!');
            //her bir posta aid cover shekilinin xeberin sayina uygun adinin deyishdirilmesi
            for (let i = row.ID + (page - 1)*15; i >= row.ID + 1; i--) {
                let minlik = parseInt(((i / 1000) + 1)) * 1000;
                let yuzluk = parseInt(((i / 100) + 1)) * 100;
                fs.rename(`./photo/${minlik}/${yuzluk}/${i}/thumb.jpg`, `./photo/${minlik}/${yuzluk}/${i}/cover.jpg`, function(err) {
                    if ( err ) console.log('FS ERROR: ' + err);
                });
            }
    for (let i = results.length-1; i >= 0; i--) { // results massivinde olan melumatlarin her birinin axirdan bashlayaraq db-ya yazilmasi ucun for
        const elem = results[i];
        var query = con.query('INSERT INTO `news2` (`title`, `desc`, `news_img`, `enabled`, `content`, `add_time`, `news_date`, `author`, `created_at`, `fb_desc`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
         [`${elem.header}`, `${elem.desc}`, `${elem.img_src}`, 0, `${elem.post}`, `${elem.add_time}`, `CURRENT_TIMESTAMP`, `node_parser`, `CURRENT_TIMESTAMP`, `${elem.desc}`], function (err, result) {//yuxarida hazirlanmish SQL sorgunun bazaya yonlendirilmesi
          if (elem.category_id.length > 1) { //categoriyanin 1-den cox olub olmamasinin yoxlanilmasi
            elem.category_id.forEach(element => {//eger categoriya 1-den coxdursa her birinin bazaya yazilmasi ucun for each
                con.query('INSERT INTO news_to_category2 (news_id, 	category_id) VALUES (?,?)', [`${result.insertId}`, `${element}`]);
            });            
          } else {//eger categoriya 1-se 
                con.query('INSERT INTO news_to_category2 (news_id, 	category_id) VALUES (?,?)', [`${result.insertId}`, `${elem.category_id[0]}`]);
          }
        if (err) throw err;  
        });
    }
    query.on('end', function() {
        con.end();
      });
}
});
// });