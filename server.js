require('dotenv').config()
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const uri=process.env.MONGO_URI;
const requestLink = require('request');
const normalize = require('normalize-text').normalizeWhitespaces;
var cheerio = require('cheerio');
const companyRoute = require('./routes/company');
const fieldRoute = require('./routes/field');
const userRoute = require('./routes/user');
const sessionRoute = require('./routes/session');

const app = express();
const port = process.env.PORT || 5555;
const DIST_DIR = path.join(__dirname, './dist'); // NEW
const HTML_FILE = path.join(DIST_DIR, 'index.html'); // NEW

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
     extended:true,
 }))
 app.use(session({
  resave: true, 
  saveUninitialized: true, 
  secret: 'somesecret', 
  cookie: { maxAge: Date.now() + (7 * 86400 * 1000) }
}));

app.use(express.static(DIST_DIR)); // NEW

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS:120000}, (err, client) => {
  if (err) {
    console.error(err)
  }

  db = client.db('mydb');
  company = db.collection('company');
  field = db.collection('field');
  user = db.collection('user');
  console.log('Connected to database');

  app.listen(port, function () {
    console.log('App listening on port: ' + port);
  });
}); 


app.get('/app/*', (req, res) => {
    res.sendFile(HTML_FILE); // EDIT
    //res.sendFile(path.join(__dirname,'./src/index.html')); // EDIT
});
  // CRAWL DATA EXAMPLE

  var count=0;

  //get data of link input
  app.get('/getlink/:page',async function(req,res,next){
  try {
    var myPromise = () => {
      return new Promise((resolve, reject) => {

          var data;
          const dataTable = []; 
          const linkurl = [];
          /////////////
          var getPage = req.params.page;
          var linkUrl1;
          var mysort = { _id: -1 };
          field.find().sort(mysort).limit(1).toArray(function(error, result) {
            if (error){
              reject(error);
            }else {
              //response.send(result);   
              linkUrl1=result[0].link+'?page='+getPage;
              //console.log('link URL = ',linkUrl1);
              //////////////

              requestLink(linkUrl1,function(error1,response1,body1){
              if (error1){
                  console.log(error1);
                }else {
                  $ = cheerio.load(body1);
                  let FieldVal = normalize($(body1).find('div#thongbaotim > div > h1').text());
                  var ds = $(body1).find('h2.company_name > a');
                  count=0;
                  var countMax=ds.length;
                  ds.each(async function(i,e){
                    try{
                      linkurl[i]  = e['attribs']['href'];

                      const data1 = await getThongTinFromURL(linkurl[i],getPage,FieldVal,data,count);

                      dataTable[i]=data1; 
                      if (count == countMax) {
                        //res.send(dataTable);
                        resolve(dataTable);
                      }
                    } catch (error) {
                      console.error('ERROR:');
                      console.error(error);
                    }
                  });    
                }
              })          
            }
          })
      });
    }
      //await myPromise
      var result = await myPromise();   
      
      //continue execution
      res.json(result);     

    } catch (e) {
      next(e)
    }
  });

  function getThongTinFromURL(obj,getPage,FieldVal,data){
    return new Promise((resolve,reject) => {
      requestLink(obj,function(error2,response2,body2){
        if (error2){
          reject(error2);
        }else {
          $ = cheerio.load(body2);
          let tenCongTyVal = $(body2).find('div.tencongty > h1').text();
          let diaChiVal = normalize($(body2).find('div.diachi_chitietcongty > div:first-of-type  p').text());
          let TelVal = normalize($(body2).find('div.diachi_chitietcongty > div  span').text());
          let EmailVal = $(body2).find('div.text_email > p > a').text();
          let WebsiteVal = $(body2).find('div.text_website > p').text();
          
          if ($(body2).find('div#listing_detail_right > div:first-of-type').hasClass('banladoanhnghiep') != true)
          {
            var HoTenPerVal,EmailPerVal,TelPerVal,PhonePerVal;
            var kt=false;
            var dss= $(body2).find('div#listing_detail_right > div:first-of-type > div > div:nth-of-type(2)');
            dss.each(function(i1,e1){
              if (kt==false){
                if ($(this).find('p').text()=='Họ tên:'){
                    HoTenPerVal=normalize($(this).next().find('p').text());
                    }
                else if ($(this).find('p').text()=='Di động:'){
                  PhonePerVal=normalize($(this).next().find('p').text());
                  }
                else if ($(this).find('p').text()=='Email:'){
                  kt=true;
                  EmailPerVal=normalize($(this).next().find('p').text());
                  }
                else if ($(this).find('p').text()=='Điện thoại:'){
                  TelPerVal=normalize($(this).next().find('p').text());
                }
              }
              else
              {
                return;
              }
            })

            data = {
              Page : getPage,
              Field : FieldVal,
              CompanyName : tenCongTyVal,
              Adress : diaChiVal,
              Tel : TelVal,
              Email : EmailVal,
              Website : WebsiteVal,
              NameContact: HoTenPerVal,
              EmailContact: EmailPerVal,
              TelContact: TelPerVal,
              CellPhoneContact: PhonePerVal
              // expand:[{
              //   NameContact: HoTenPerVal,
              //   EmailContact: EmailPerVal,
              //   TelContact: TelPerVal,
              //   CellPhoneContact: PhonePerVal
              // }]
            }
          }
          else{
            data = {
              Page : getPage,
              Field : FieldVal,
              CompanyName : tenCongTyVal,
              Adress : diaChiVal,
              Tel : TelVal,
              Email : EmailVal,
              Website : WebsiteVal,
              NameContact: HoTenPerVal,
              EmailContact: EmailPerVal,
              TelContact: TelPerVal,
              CellPhoneContact: PhonePerVal
              // expand:[{
              //   NameContact: HoTenPerVal,
              //   EmailContact: EmailPerVal,
              //   TelContact: TelPerVal,
              //   CellPhoneContact: PhonePerVal
              // }]
            }
          }
          count=count+1;
          resolve(data);

        }                
      })
    });
  }
  
app.use('',companyRoute);
app.use('',fieldRoute);
app.use('/user',userRoute);
app.use('/',sessionRoute);
