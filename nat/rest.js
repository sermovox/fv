let http,https,request;
// **************  difference with bot version : SSSS
/*

const http = require('http');
webserver=require("express")()



http_ = http.createServer(webserver);
 http_.listen(port || 3000, () => {
        //if (this._config.disable_console !== true) 
        {
            console.log(`Webhook endpoint online:  http://localhost:${port || 3000} at /webhook_uri`);
        }
        // this.completeDep('webserver');
    });

here we'll use http_.request()

*/

 module.exports ={// returns Promise
     init:function(http_,https_,request_){//console.log('rest init : load http: ',http_);
      http=http_;https=https_;request=request_},
     jrest:function(url,method,data,head, urlenc,qs){/* used in fv : 

                                                          response = {data, token}=await  this.rest(uri, method,formObj,head) 
                                                          .catch((err) => { console.error(' REST got ERROR : ',err); }); 
                                                          let dataobj=JSON.parse(response.data);


                                                      */                     
                                                      // other methods : 
      
                                                      // data ={prop1:value1,,,}  , the js plain 1 level obj (js map)
                                                      //  POST :
                                                      //        qs, urlenc  are post only param :    if urlenc = true send a    x-www-form-urlencoded body (got from qs (x-www-form-urlencoded) or coding  data obj )
                                                      //        if urlenc=false: send json from  data . data must be a plain js obj or its json string . anyway will be sent as json ( header is built)

                                                      //  GET :  json case :
                                                      // obj=JSON.parse(await jrest(myurl,method='GET',{user:null},{"Content-Type": "application/json"}, true,null) ) 
         // use :
         // response = await jrest("http://postman-echo.com/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new",GET,null)
         // response = await jrest("http://postman-echo.com/integers",GET,{num:1,min:1,max:10,col:1,base:10,format:'plain',rnd:'new'})
         // response = await jrest("postman-echo.com/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new",GET,null)
         // response = await jrest("https://postman-echo.com/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new",GET,null,{Authorization:'bearer ....'})
                  // response = await  jrest("https://postman-echo.com/someendp',POST,{title: "Make a request with Node's http module"})
         //   NO : or  response = await jrest("https://postman-echo.com/integers",GET,{num:1,min:1,max:10,col:11,format:'plain',rnd:'new'})?? NO
         // .catch((err) => { console.error(err); });  or  .catch(console.error);

         // .catch((err) => { console.error(err); });  or  .catch(console.error);

         // if(response){data=JSON.parse(response.data);token=response.token);   SSSS


       //  console.log('rest called with body:',data,' http: ',http,' req: ',http.request);
         let du,h=http;
         if(url.substring(0,4)=='http'){
         if((du=url.charAt(4))==':');else if((du=url.charAt(4))=='s')h=https;
         else return;// or return a rejected promise 
         }else url='http://'+url;

         if(http){if(method=='GET')return new Promise((resolve, reject) => jhttpget(h,url,data,head,resolve,reject));
                 else if(method=='POST')return new Promise((resolve, reject) => jhttppost(h,url,data,head,qs, urlenc,resolve,reject));}
     }
     /*
     ,
     rest:function(url,method,data){// data ={prop1:value1,,,}
     // use :
     // response = await jrest("https://postman-echo.com/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new",GET,null)
     //   or  response = await jrest("https://postman-echo.com/integers",GET,{num:1,min:1,max:10,col:11,format:'plain',rnd:'new'})
     // .catch((err) => { console.error(err); });  or  .catch(console.error);


     // response = await  jrest("https://postman-echo.com/someendp',POST,{title: "Make a request with Node's http module"})
     // .catch((err) => { console.error(err); });  or  .catch(console.error);

     // if(response)data=JSON.parse(response);

     if(http){if(method=='GET')return new Promise((resolve, reject) => httpget(url,data,resolve,reject));
             else if(method=='POST')return new Promise((resolve, reject) => httppost(url,data,resolve,reject));}
     }*/

 }

 function jhttpget(h,url,data,head,resolve,reject){//data not used ,  we can have   url with qs OR  url is host and  data is a literal obj 
// url=:http......


/*
 let options = new URL(url);//url="https://postman-echo.com/status/200" + '?access_token=' + this._config.token&......
 let qs;
 if(data_){
   qs=toParam(data_);
  if(qs){
  options = {
    hostname: url,//'whatever.com', or 'whatever.com/integers'
    // port: 443,
    path: '/?'+qs,//'/todos',// path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new', 
                  //  or '/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
    method: 'GET'
  }
}
}
console.log(' REST is request a GET with : ',options);

let myRequest = http.request(options, res => {

  let data = ""
  res.on("data", d => {
    data += d
  })
  res.on("end", () => {
    resolve(data);
  })
});

myRequest.on("error", reject);
myRequest.end();}

*/


// from https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html

/*
const options = {
  hostname: 'httpbin.org',
  path: '/get',   // also '/planetary/apod?api_key=DEMO_KEY' ???
  headers: {
      Authorization: 'authKey'
  }
}*/
// accept data instead of qs 
if(url.indexOf('?')<0&&data)// se non c'à ? add param from data
url+='?'+toParam(data);// should be used : /?


let opt;
if(head)// opt={   eaders: { Authorization: ''}}
opt={headers:head};else opt={};
h.get(url,//'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', 
opt,
(resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    //console.log('rest responded ',data);
    resolve({data,token:''});
  });

}).on("error", (err) => {
 reject// console.log("Error: " + err.message);
});








 }



function jhttppost(h, url, data_, head, qs, urlenc, resolve, reject) {// data_ is a map obj, qs is query string .
                                                                       //  urlenc =encJson=true needs data_,
                                                                      //   urlenc =encJson=false  needs qs or  data_
                                                                      // if urlenc =true :  put in body the  urlencoded  qs or urlencoded the js map data_
                                                                      // if urlenc= false : put in body the  json of the js map data_ or suppose its alredy in son format if type=string
  let body, head_;


    if (!urlenc) {
      if (!data_) {
        body={};// no data , data cant be provided from qs if we want to encode data with  json format
      } else {// case data_ + json enc :
        if (typeof (data_) === 'string') body=data_;
        else body = JSON.stringify(data_);//{    title: "Make a request with Node's http module"  })
        head_= {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        };
      }

    } else {// case encode data as x-www-form-urlencoded
      if (qs) {
        body = qs;// put qs in body as is 

      } else {// get qs from form/data_ map obj 
        if (data_) {
          body = toParam(data_);// transform a plain obj in qs format and set body
        } else {
          body='';// no data_, no qs , so request post with no data 
        }

      }
      head_= {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body)
      };

    }
  
  let options = {
    // xxxxx  hostname: url,//"postman-echo.com",// can i "postman-echo.com/post" ?
    //path: "/post",// port: 443,
    method: "POST",
    headers: head_
  };
  //console.log('jhttppost h.request firing ,head: ',head,' options: ',JSON.stringify(options,null,2));
  if (head) Object.assign(options.headers, head);
  console.log('jhttppost h.request firing , options: ',JSON.stringify(options,null,2),'\n url: ',url);
  h.request( // sarebbe http_.request()
    url,// or in xxxxx
    options, res => {
        // to get cookies see https://newspaint.wordpress.com/2015/09/06/how-to-get-cookies-from-node-js-http-response/
    // display returned cookies in header
    let setcookie = res.headers["set-cookie"],// [ 'bar=baz; foo=bar' ]
        token;
       // console.log('cookie string found: ', setcookie,'\n res headers: ',JSON.stringify(res.headers,null,2));
    
    
    if ( setcookie ) {// 
      // setcookie.forEach(function ( cookiestr ) { console.log( "COOKIE:" + cookiestr ); } );
      setcookie.forEach(function ( cookiestr ){// setcookie=[cookiestring1,cookiestring2,,,]
      let x = getCookie(cookiestr,'XSRF-TOKEN');
          if (x) {token=x; 
                  console.log('cookie XSRF-TOKEN found: ', x);
          }   
      })  
    }

      let data = "";
      res.on("data", d => { data += d });
      res.on("end", () => {console.log(' rest end : ',{data,token});
        resolve({data,token});// if token is undefined wont be added as property
      });


      function getCookie(cookiestr,name) {// from https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript

       // console.log('getCookie test cookie string : ',cookiestr,'\n for cookie: ',name);
        var nameEQ = name + "=";
        var ca = cookiestr.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
      }

    })

    .on("error", reject)//console.error) >>>>>>>>>><   will call .catch in calling sw !

    
    // .write(body).end(); or : 
    .end(body)// launch on json data
}


  //  see https://stackoverflow.com/questions/27822162/encode-object-literal-as-url-query-string-in-javascript 
  //  http://jsfiddle.net/mg511z7w/

// var data = {"apple": [{"kiwi": "orange"}, {"banana": "lemon"}], "pear": "passion fruit"};
// to check : toplevel={"pear": "passion fruit"} ??

var stringifyParam = function(data, topLevel, keyProp) {// from obj to qs
        var string = '';
        for (var key in data) {
            if(keyProp && topLevel[keyProp] ) {
                if ( (topLevel[keyProp] instanceof Array&&topLevel[keyProp].indexOf(data[key])!==0) ) {
                    string += keyProp;
                } else if ( (topLevel[keyProp] instanceof Object&&topLevel[keyProp][key]) ) {
                    string += keyProp;
                }
            }
            if (typeof(topLevel[key])=='undefined') {
                string += '[' + key + ']';
            }
            if (data[key] instanceof Array) {
                string += stringifyParam(data[key], topLevel, key);
            } else if(data[key] instanceof Object){
                string += stringifyParam(data[key], topLevel, key);            
            } else {
                if (typeof(topLevel[key])!='undefined') {
                    string += key;
                }
                string += '=' + data[key];
                string += '&';
            }
        }
        return string;
    },
    toParam = function(data){// from plain 1 level obj to qs in encoded format
        var string = stringifyParam(data,data);// from 1 level obj to qs
        //return encodeURI(string.substring(0,string.length-1).split(' ').join('+'));// case 1 :  ' '  >  +
        return encodeURI(string.substring(0,string.length-1));// case 2 :   ' ' > %20  // encode qs 
    };