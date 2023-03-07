var mqtt = require('mqtt');// http://www.steves-internet-guide.com/using-node-mqtt-client/
                            // https://www.macrometa.com/iot-infrastructure/node-js-mqtt
//const caFile = fs.readFileSync("ca.crt");
var fs = require('fs'); //require filesystem module
const caFile = fs.readFileSync("chain.pem");// ./chain.pem
const options = {// conn opn
    port: 1883,
    host: 'bot.sermovox.com',
    clientId: "sermovox-01",
    username: "sermovox",
    password: "sime01",
    clean: true,
    reconnectPeriod: 5000 // Try reconnecting in 5 seconds if connection is lost
    // credential ca ??
},tlsoptions = {// conn opn
    // if not in url add here :
    port: 8883,
    host: 'bot.sermovox.com',
    protocol:"mqtts",


    clientId: "sermovox-01_persistence",//clientId: 'mqttjs_' + 'persistence'
    username: "sermovox",
    password: "sime01",
    clean: true,
    reconnectPeriod: 5000 // Try reconnecting in 5 seconds if connection is lost
    ,ca:caFile // see http://www.steves-internet-guide.com/using-node-mqtt-client/ and mosquitto.conf
    // credential ca ??
},
    opt = {
        retain: true
        //,qos: 1
    };

let client;

// Subscribe variables
let shelly_stopic = 'shellies/',shelly_topicp = '/relay/0';
let shelly_options = {qos: 0};// needed really ?

// Publish variables
let shelly_topicpp = '/relay/0/command';
let messageOn = 'on', messageOff = 'off';
let pub_options = {qos: 0, retain: false};// in http://www.steves-internet-guide.com/using-node-mqtt-client/ use    ={retain:true,qos:1}

function isShelly(text){// text=topic, returning devid
    //= "shellies/shelly1-98F4ABF298AD/relay";
let ok=35<=text.length;
if(text.slice(0,8)=='shellies'&&text.slice(-8)==shelly_topicp&&ok){// ok also ?
   console.log("Received message  on  shelly topic: " + text);
    let devName=text.slice(9,-8),devid;
   for(mel in gpio){if (gpio[mel]==devName){devid=mel;break;}}
   return devid;
     
}else  console.log("Received message on  non shelly topic: " + text);
return null;
}

    //client = mqtt.connect("mqtt://192.168.1.157", options);
    // or x tsl :
    // var client  = mqtt.connect("mqtts://192.168.1.71:8883",tlsoptions);
    console.log("mqtt starting :  asking connection to broker with ops: " + JSON.stringify(options,null,2));
client = mqtt.connect(options);


if(client)client.on('message', function (topic, message) {// message=obj=buffer
    let msg=message.toString();
    console.log("Received message: " + msg + ", on topic: " + topic.toString());
    let dev;
    if(dev=isShelly(topic)){// device  id ex: 11 , not : shelly1-34945475FE06
       // status[dev]=status[dev]||{};
        
        // satisfy all pending listeners : (nb []  added  in init func , that can be still to call)
        if(statusList[dev]){
            if(statusList[dev].length>0){
                console.log("Received message , we found : ",statusList[dev].length,"listener to call , so scanit to cb=resolve them" );
                console.log("... probably listere was added as msg queue is (0 expected ) Received message , we found : ",status[dev] );
            let count=0;
            statusList[dev].forEach((el)=>{count++;el(msg)});// el is the resolving func resolve !
            console.log("Received message , we called: ",count,"listener " );
        }
        statusList[dev].length=0;// reset anyway
    }
        console.log(" Received message , current msg queue had: ",status[dev].length,' elements' );
        if(status[dev]&&status[dev].push(msg)>10)status[dev]= status[dev].slice(-2);// add queue
    }
});
let gpio;//={"11":'shelly1-34945475FE06'};// todo : fill with init !   nb dev=11  devname=shelly1-34945475FE06
let status={},// queue ** su topic shellies/<model>-<deviceid>/relay if dev array is null (status[dev]=null) means no connected 
    statusList={};// the listener list  x last status {dev:[],dev2:[]}
let stList=function (dev,token,cb){// cb is the promise resolve, this is the closure with private properties to reference the listener env (cb will operate on listener context)
    statusList[dev].push(function(lastmsg){
        console.log(' stlist() listener cb with lastmsg: ',lastmsg);
        cb(lastmsg);
    });

}
// lare in init : Object.keys(gpio).forEach((el)=>{status[el]=null});

let futurecb={};// cb of subcribe can resolve a request to get a new fc dev ctl
                // but if the cb comes before someone request a new dev ctl , when the request is done will find the cb has called as 

async function getgpio(gp){// last entry in status[gpio] array
    if(status[gp]){
        console.log('  getgpio wants read buffer for dev: ',gp,', , its  dim is: ',status[gp].length);
        if(status[gp].length>0)return status[gp][status[gp].length-1];//  WARNING ::
                                                                    //  last message in queue , <<<<  hope a message caused after a write operation, eventually rewrite the same value
                                                                    // till get a read = the last  write
        else {
            // wait till get a msg or timeout
            // add a promise in dev queue with a token associated to last write (better leave the write to add this listener ,
            // then here we can .then the promise with that token 
            
               return  new Promise((res,rej)=>{// the listener cb
                    // register with token
                    // old : statusList[gp].push(function(){ return function(lastdata) });

                    stList(gp,123,res);

                })
            

        }
    }
}


function start(){// wait connection and subsribe all gpio , so  as soon cb is called we have status[gp]=[] (the subscription is ok )
if(!client)return false 
console.log("mqtt start() : waiting connection cb  to mosquitto, connection state: " + client.connected);
client.on("connect", function () {
    console.log("mqtt connected to mosquitto: " + client.connected,' now well subscript all devices ');

    client.subscribe('presence', function (err) {// to do to see if there is the dev connected 
        if (!err) {
            // client.publish('presence', 'Hello mqtt')
        }
    });
    let keylist=  Object.keys(gpio);

    keylist.forEach((key) => {
        // if('shelly')
        let devkey=gpio[key];
        let sub_topic=shelly_stopic+devkey+shelly_topicp;// shellies/<model>-<deviceid>/relay
        client.subscribe(sub_topic, shelly_options, function (err) {
            if (err) {
                console.log("An error occurred while subscribing shelly")
            } else {
                status[key]=[];// init array, so now is subscribed , was null (no subscribed)
                console.log("Subscribed successfully to shelly cmd topic" + sub_topic.toString());
                if(futurecb[key])futurecb[key]();// check point to goon later when we want the gp ctl 
            }
        });

    });




    client.publish("testtopic", "test message", opt);

});
// dont wait return async , wait later on futurecb[key]
return true;
}


client.on("error", function (error) {
    console.log("Can't connect" + error);
    process.exit(1);// cant retry
});

// Notify reconnection
client.on("reconnect", function () {
    console.log("Reconnection starting");
});

// Notify offline status
client.on("offline", function () {
    console.log("Currently offline. Please check internet!");
});

/*
https://indomus.it/formazione/shelly-mqtt-e-http-comandi-utili/
https://shelly-api-docs.shelly.cloud/gen1/#availability-and-announces
https://www.giorgioravera.it/mqtt-e-shelly/


shellies/<shellymodel>-<deviceid>/announce

su un shelly  “shelly1-98F4ABF298AD” 
pubblico un topic comando + payload :
 “shellies/command announce” o shellies/shelly1-98F4ABF298AD/command + announce

 risponde su topic payload :
 shellies/shelly1-98F4ABF298AD/online true

shellies/announce {“id”:”shelly1-98F4ABF298AD”,”mac”:”98F4ABF298AD”,”ip”:”192.168.1.81″,”new_fw”:false, “fw_ver”:”20200206-083100/v1.5.10@e6a4205e”}


pubblicando :
shellies/<model>-<deviceid>/relay/0 + ??

risponde lo stato su topic  : shellies/<model>-<deviceid>/relay **
.............


pubblicando :

shellies/<model>-<deviceid>/relay/0/command  + on/off
risponde : su topic shellies/<model>-<deviceid>/relay  **


*/

let fc= function (gp,ind){// mqtt gpio constructor new fc will return the io ctl
    this.gpio=gp;// the gpio id as number of the device  io ctl
    this.devNumb=ind;
    // do later 
   //
    if(status[gp]) this.isOn=true;// is subscribed ! at least status[gp] =[]
   //
     else this.isOn=false;

    // return this ! if .isOn the ctl is active

}
fc.prototype.readSync =// dont need  async 
                        function (){
    // in case of a previous write the msg queue is cleared so the effect of a write can be read also waiting some time !
    let gp=this.gpio
    if(gpio[gp]&&client.connected
        // &&status[gp]
        ){// still registered, subscribed, connected 

    let resolRead=getgpio(gp);// get last queue entry
    console.log('mqtt readsync read value from queue or listener, promise : ',resolRead);
            return resolRead;
    }else return Promise.resolve(null);// data not available

}

fc.prototype.writeSync = function (val){// val 0/1, can return false if in error 
    let gp=this.gpio
    if(gpio[gp]&&client&&client.connected&&status[gp]){// registered, subscribed, connected 

        let pub_topic=shelly_stopic+gpio[gp]+shelly_topicpp;// shellies/ + <model>-<deviceid> + /relay/0/command  
        let message;if(val==0)message=messageOff;else message=messageOn;

// clear msg queue ( and its listener ?)
// WARNING hope a message in transit dont get here meanwile !!!!
status[gp].length=0;

    client.publish(pub_topic, message, pub_options, function (err) {
        if (err) {
            console.log("An error occurred during publish on dev: ",gp);
            return false;
        } else {
            console.log("Published successfully to " + pub_topic.toString());
            return true;
        }
    });
}else return false;
}


module.exports ={// returns ...
    avail:null,// null, true,false th connection to broker is ok
    // use : await read()

    init:function(gpio_={11:'shelly1-34945475FE06'}){// wait connection and subsribe all gpio , 
                                                    // so  as soon cb is called we have status[gp]=[] (the subscription is ok )

                                                    //  old :  'gpio_11':[[id,topic],,,,,,]}){//console.log('rest init : load http: ',http_);
       for(dev in gpio_){
       // status[dev]=null;// queue ** su topic shellies/<model>-<deviceid>/relay if array is null means no connected 
       futurecb[dev]=null;// it will be filled by the request of a dev ctl
       status[dev]=null;// not subscribed jet !
       statusList[dev]=[];// init list arrays
       }
       //if(client.connected)return true; else return false;
       gpio=gpio_;
       if(start()){
        this.avail=true;// connected to broker, wating for all dev subscription cb
        return this;
       }else {
        this.avail=false;
        return null;
       }
    },

    fact:function(gp,ind){// a factory, usually returns a obj, but as our obj is the resolve of a promise the caller of the fact  must await or thenable that promise return 
        let res_;
        

        return new Promise((res,rej)=>{// resolved in  a dev ctl  

            if(status[gp]){// is already subscript, as the subscript cb is called and set status[gp]
                console.log(' factory is resolving the dev (',gp,') ctl as it s alredy subscribed');
                res({ctl:new fc(gp,ind),devNumb:ind,type:'mqtt'});
            }else{// register a resolver when the cb will come
                console.log(' factory is setting the subscribing cb to give the dev ctl , dev:',gp);
                futurecb[gp]=function (){// when this func will be called (by subscription cb )we resolve giving the device ctl
                    res({ctl:new fc(gp,ind),devNumb:ind,type:'mqtt'});
                }
            }
        })

    }
}


