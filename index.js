console.log('Fish-Temperature');
const db = require('mongoose');
const express = require('express');
const sensor = require('ds18x20');
const app = express();
const cron = require('node-cron');
const ip = require('ip');
db.connect('mongodb://lora:loralora2@ds046027.mlab.com:46027/garten', {useNewUrlParser: true});
app.set('view engine', 'ejs');

app.get('/temp', function(req, resp){
    resp.render('index');
});

let fishTempSchema  = db.Schema({
    ip: {type: String},
    temperature: {type: String},
    update_date: {type: Date, default: Date.now}
});

let TempFish = db.model('fishWater', fishTempSchema, 'fishWater');

cron.schedule("00 10 * * * *", function() {
  sensor.get('28-0517a1b2b1ff', function (err, temp) {
    if (err) {
       console.log(err);
    return; }
    let record = {
      ip : ip.address(),
      temperature : temp
    };
    TempFish(record).save(function(err, dat){
       if (err) { console.log(err); }
       console.log(dat);
    });
  });
});

app.get('/', function(req,resp){
    sensor.get('28-0517a1b2b1ff', function (err, temp) {
        if (err) {
            console.log('klaida: ' + err);
            let tt = new Date();
            let dateString = tt.getFullYear() + ' ' + (tt.getMonth()+1) + ' ' + (tt.getDate()+1) + ' ';
            let dayString = (tt.getHours()+1) + ' ' + (tt.getMinutes()+1) + ' ' + (tt.getSeconds()+1) + ' ';
            resp.status(200).send(dateString + dayString +  ', klaida: ' + err);
            return;
        }
        console.log('temperature: ' + temp);
        resp.render('index', {temperature: temp});
    });
});

app.listen(5000);