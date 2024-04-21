require('dotenv').config();
const express = require('express');
let bodyParser=require("body-parser");
const cors = require('cors');
const crypto = require('crypto');
const dns = require('dns');
const url = require('url');
const app = express();
const urlDatabase={};
// const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
// const urlRegex = /^(https?:\/\/)([\da-z\.-]+\.)+([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
let counter =1;

app.use(bodyParser.urlencoded({extended: false}));


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req,res)=>{
  const original = req.body.url;
  console.log(`Received URL: ${original}`);
  // if(!urlRegex.test(original)){
  //   console.log('Invalid URL format.'); 
  //   return res.status(400).json({error: 'invalid url'});
  // }
  try{
      const parsedUrl = new URL(original);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        console.log("Invalid URL protocol!");
      }
      
      const hostname = parsedUrl.hostname;

      dns.lookup(hostname,(err,address)=>{
        if(err || !address){
        res.json({error: 'invalid url'});
        return;
        }
        console.log('IP Address:', address);
        const shortcode = counter++;
        urlDatabase[shortcode] = original;
        console.log(`Shortcode ${shortcode} assigned to ${original}`); 
        res.json({original_url:original, short_url:shortcode})
     })
    }catch(error){
      console.error('Error:', error);
      return res.json({ error: 'invalid url' });
    }
    })

app.get("/api/shorturl/:shortcode", (req,res)=>{
  
  const shortcode = Number(req.params.shortcode);
  console.log(`Lookup for shortcode: ${shortcode}`);
  // if(shortcode in urlDatabase && !isNaN(shortcode)){
  //   originalUrl = urlDatabase[shortcode];
  // }else{
  //   return res.status(404).json({error: 'invalid shortcode'});
  // }
  if (isNaN(shortcode) || !(shortcode in urlDatabase)) {
    console.log('Invalid or non-existent shortcode.');
    return res.status(404).json({ error: 'invalid shortcode' });
  }
  const originalUrl = urlDatabase[shortcode];
  res.redirect(originalUrl);
})

// Function to generate a short code for a URL
// function generateShortCode(url) {
//   // Generate a hash of the URL using SHA-256
//   const hash = crypto.createHash('sha256').update(url).digest('base64');

//   // Take the first 6 characters of the hash as the short code
//   return hash.slice(0, 2);
// }

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
