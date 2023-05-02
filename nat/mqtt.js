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

// std Subscribe variables, in future will be customized using gpio set from device model config data in init() according with the type requested 
let shelly_stopic = 'shellies/',shelly_topicp = '/relay/0';
let shelly_options = {qos: 0};// needed really ?

// Publish variables
let shelly_topicpp = '/relay/0/command';
let messageOn = 'on', messageOff = 'off';
let pub_options = {qos: 0, retain: false};// in http://www.steves-internet-guide.com/using-node-mqtt-client/ use    ={retain:true,qos:1}

function isShelly(text){// text=topic, returning devid, the key in  gpio
    //= "shellies/shelly1-98F4ABF298AD/relay";
let ok=35<=text.length;
if(text.slice(0,8)=='shellies'&&text.slice(-8)==shelly_topicp&&ok){// ok also ?
   console.log("Received message  on  shelly topic: " + text,', now see if is a registerd portid');
   /* old :
   let devName=text.slice(9,-8),devid;// devName=shelly1-98F4ABF298AD; devid=11 the keys in gp
   for(mel in gpio){if (gpio[mel]==devName){devid=mel;break;}}*/
   let devid=invTopic[text];//portid,cant be 0 !
    if(!devid)devid=null;
   return devid;
     
}else  console.log("mqtt Received message on  non shelly topic: " + text);
return null;
}
function isProbe(text){// text=topic, returning devid that has that template(topic=text), , was the key in  gpio
    //= "shellies/shelly1-98F4ABF298AD/relay";
let ok=35<=text.length;

   console.log("isProbe(): Received message  on  topic: " + text);
    let devid=null;// devName=shelly1-98F4ABF298AD; devid=11 the keys in gp
   /* old : 
   for(mel in mqttprob){
    if (mqttprob[mel].topic==text){devid=mel;break;}
    else if('ctl_'+mqttprob[mel].subtopic+mqttprob[mel].varx==text){devid=mel;break;}}*/

    devid=invTopic[text];//portid,cant be 0 !
   //  if(!devid)devid=null;


   if(devid==null) {console.log("isProbe(): mqtt Received message on  non probe topic: " + text);return null;}
   else return devid;
  
   }
     


    //client = mqtt.connect("mqtt://192.168.1.157", options);
    // or x tsl :
    // var client  = mqtt.connect("mqtts://192.168.1.71:8883",tlsoptions);
    console.log("mqtt starting :  asking connection to broker with ops: " + JSON.stringify(options,null,2));
client = mqtt.connect(options);


if (client) {
    console.log("mqtt client connecting .... , so registering message listener ...");
    client.on('message', function (topic, message) {// message=obj=buffer
        let msg = message.toString();
        console.log("mqtt Received message: " + msg + ", on topic: " + topic.toString());
        let dev;
        if ((dev = isShelly(topic))!=null || (dev = isProbe(topic))!=null  ) {// use statusList and queue status[dev] built for dev whose config is described in  gpio and  mqttprob
                                    // >>> satisfy all listener waiting for a msg , fill queue status[dev] to satisfy future coming read for msg request
            // device  id ex: 11 , not : shelly1-34945475FE06
            // status[dev]=status[dev]||{};

            // satisfy all pending listeners : (nb []  added  in init func , that can be still to call)
            if (statusList[dev]) {// pending listener for device number id=portid=11
                if (statusList[dev].length > 0) {
                    console.log("Received message , we found : ", statusList[dev].length, "listener to call , so scanit to cb=resolve them");
                    console.log("... probably listere was added as msg queue is (0 expected ) Received message , we found : ", status[dev]);
                    let count = 0;
                    statusList[dev].forEach((el) => { count++; el(msg) });// el is the resolving func resolve !
                    console.log("Received message , we called: ", count, " msg listener ");
                }
                statusList[dev].length = 0;// reset anyway
            }
            if(status[dev])// // subscribed !
                            console.log(" Received message , current msg queue for device:",dev," had: ", status[dev].length, ' elements');
            else console.log(" Received message , current msg queue for device:",dev," had not been subscribed ");

            if (status[dev] && status[dev].push(msg) > 10) status[dev] = status[dev].slice(-2);// add queue
        }else{

           //  ...write here code  for topic different from gpio (cfg in gpio) and probe-var (cfg in mqttprob) devices
        }









    });
}
let gpio=null,// now substituted by mqttnumb .    gpio,//={"11":'shelly1-34945475FE06'};// todo : fill with init !   nb dev=11  devname=shelly1-34945475FE06. cfg of gpio like dev (relay)
mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
        // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
        //    // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
mqttnumbTop={},//  calculated topic 
mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (class=probe/var + isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
        // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
mqttprobTop={},// //  calculated topic
invTopic={};// topic > dev portid  inv map x both mqttnumb and mqttprob
let status={},// plant devid/portid dev queues ** su topic shellies/<model>-<deviceid>/relay if dev array is null (status[dev]=null) means no connected .
                //  both for gpio and probe/var topic/dev
    statusList={};// array od listeners: the listener list  x last status {dev:[],dev2:[]}
                //  both for gpio and probe/var topic/dev

/*let stList=function (dev,token,cb){// cb is the promise resolve, this is the closure with private properties to reference the listener env (cb will operate on listener context)
    statusList[dev].push(function(lastmsg){
        console.log(' stlist() listener cb with lastmsg: ',lastmsg);
        cb(lastmsg);
    });
}*/
// easier :
function stList(dev,token){// return a promise that is resolved when a listener , added to a dev listener list, is called with a msg
                            // todo : add a reject to fire after a max time is reached
   
    return  new Promise((res,rej)=>{// the listener cb
    statusList[dev].push(function(lastmsg){
        console.log(' stlist() listener cb with lastmsg: ',lastmsg);
        res(lastmsg);
    });
})}


// lare in init : Object.keys(gpio).forEach((el)=>{status[el]=null});

let futurecb={};// cb of subcribe can resolve a request to get a new fc dev ctl . both for gpio and probe/var topic
                // but if the cb comes before someone request a new dev ctl , when the request is done will find the cb has called as 

async function getgpio(gp,clas){// get last entry in status[gpio] queue array, leave in array only last msg OR fill a listener for coming msg
                            // nb first time we receive a  msg queue is filled and we  wont  use listener if future
                            //   nb msg in queue can be very old !!! 
                            // , returns 0 or 1 !
    let ret=0;// def return
    async function rread(){
        let re;
    if(status[gp]){// the device filled alredy its msg queue , so get the last msg !
        console.log('  getgpio wants read buffer for dev: ',gp,', , its  dim is: ',status[gp].length);
        if(status[gp].length>0)re= status[gp][status[gp].length-1];//  WARNING ::
                                                                    //  last message in queue , <<<<  hope a message caused after a write operation, eventually rewrite the same value
                                                                    // till get a read = the last  write
        else {
            // wait till get a msg or timeout
            // add a promise in dev queue with a token associated to last write (better leave the write to add this listener ,
            // then here we can .then the promise with that token 
 
                /* error : no need to return a promise in a async call !!!!!!!!!!!!!!!!
               return  new Promise((res,rej)=>{// the listener cb
                    // register with token
                    // old : statusList[gp].push(function(){ return function(lastdata) });
                    stList(gp,123,res); })*/  
            // easier: (yu can simplify all promises  returning only one promise here without using an async !)
            re= await stList(gp,123);// add a listener for device gp. when a msg arrives the listener will be called and resolves
        }

        if (clas == 1) {// rele
            if(this.cfg.protocol=='shelly')
                {if (re == 'on') return 1; else return 0;}
                else return null;// unknown
        }// relays value: 0/1
        else if (clas == 2) {// a var in mqttnumb
            if (re == '>ctlpresent') return rread();// discard this or other  ctl presence
            else return re;

    }else if (clas == 3) {// probe in mqttprob
        if (this.cfg.protocol=='shelly')
        {return re;}
        else return null;// unknown protocol
        

        } else if (clas == 4) {// a var in mqttnumb



            if (re == '>ctlpresent') return rread();// discard this or other  ctl presence
            else return re;
            

    }else return null;// error !
        
    }
}
  return rread();

}


function start(){// wait connection and subscribe all gpio , so  as soon cb is called we have set status[gp]=[] (the subscription is ok )
                // in future subscribe when the fc(gp,ind,type) is called as the device can be used differently depending on the type requested 
if(!client){
    console.error("mqtt start() :client not available jet, too late ! recovering  todo ....");
    return false }
console.log("mqtt start() :  waiting connection cb  to mosquitto, connection state: " + client.connected);
let onlyone=false;
if(!client.connected)client.on("connect",onconnection);else if(client.connected)onconnection();
    function onconnection() {
        if (onlyone) return;
        onlyone = true;
        console.log("mqtt connected to mosquitto: " + client.connected, ' now we have to  subscript all devices with its topic ');

        client.subscribe('presence', function (err) {// usefull?, to do to see if there is the dev connected 
            if (!err) {
                // client.publish('presence', 'Hello mqtt')
            }
        });

        // let keylist=  Object.keys(gpio);//mqttnum   keys



        // >>>>>>>  function  map portid dev > its topic   + store inverted map     

        mqttnumb.forEach((val) => {// subscribe all relay key/dev, registered in gpio by init(), in order to call readSync()
            // if('shelly')
            //  let devkey=gpio[key];
            // 

            // subtopic:'shelly1-34945475FE06
            if(val==null)return false;
            let { portid, varx, isprobe, clas, protocol, subtopic } = val;


            // now use std Subscribe variables for shelly 1 or shelly ht , 
            // todo in future :
            //      - will be customized using gpio set from device model config data in init() according with the type requested 
            //      - must be done when fc device is created because the subsciption data can depend on the way we want to use the device ( the type requested in fc(gp,ind,type))
            let topic;
            if (clas == 'out') {// rele
                if (protocol == 'shelly') {

                    topic = shelly_stopic + subtopic + shelly_topicp;// shellies/<model>-<deviceid>/relay
                    

                    client.subscribe(topic, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                        if (err) {
                            console.log("An error occurred while subscribing shelly");
                        } else {
                            status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                            console.log("Subscribed successfully to shelly cmd topic" + topic.toString());
                            if (futurecb[portid]) futurecb[portid]();// check point to goon later when we want the gp ctl 
                        }
                    });


                } else return false;// other prococol x 'out' !!!!!!!!!!!!!!!!!!!
            }else if (!isprobe && varx != null && clas == 'var') {


                if (protocol == 'mqttstate') {

                    topic= 'ctl_' + subtopic + varx;// warning we add ctl_   !!!!!


                    client.publish(topic, ">ctlpresent", opt);// send msg with testtopic topic for debug and trace in var itself a connection was asked?
                                                                // >>> if the server keeps last var state we delete the current value ! 
                                                                // forse e meglio mndare il msg >ctlpresent solo se dopo aver subscribed non ricevo nulla e so che sto aprendo per la prima volta questa var 

                    // now use std Subscribe variables for shelly 1 or shelly ht , 
                    // todo in future :
                    //      - will be customized using gpio set from device model config data in init() according with the type requested 
                    //      - must be done when fc device is created because the subsciption data can depend on the way we want to use the device ( the type requested in fc(gp,ind,type))
                    
                    client.subscribe(topic, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                        if (err) {
                            console.log("An error occurred while subscribing shelly")
                        } else {
                            status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                            console.log("Subscribed successfully as var topic: " + topic.toString());
                            if (futurecb[portid]) futurecb[portid]();// check point to goon later when we want the gp ctl 
                        }
                    });
                } else return false;// error 
              


            } else return false;// end clas checks

            if(topic){mqttnumbTop[portid]=topic;invTopic[topic]=portid;}// complete cfg to easier/better dev management !
            return true;// ??


        });


        //  let problist=  Object.keys(mqttprob);// the prob/var mqtt dev

        mqttprob.forEach((val) => {// subscribe all relay key/dev, registered in mqttprob by init(), 
            // if('shelly')
            //let prob=mqttprob[val];// = mqttprob di models
            // 


            let { portid, subtopic, varx, isprobe, clas, protocol } = val,
                topic;

            if (!isprobe && varx != null && clas == 'var') {// a var in mqttprob
                if (protocol == 'mqttstate') {// state persistant in mqtt server, interfaciable with node red 

                    topic= 'ctl_' + subtopic + varx;// warning we add ctl_   !!!!!
                    client.publish(topic, ">ctlpresent", opt);// send msg with testtopic topic for debug

                    // now use std Subscribe variables for shelly 1 or shelly ht , 
                    // todo in future :
                    //      - will be customized using gpio set from device model config data in init() according with the type requested 
                    //      - must be done when fc device is created because the subsciption data can depend on the way we want to use the device ( the type requested in fc(gp,ind,type))

                    client.subscribe(topic, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                        if (err) {
                            console.log("An error occurred while subscribing shelly")
                        } else {
                            status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                            console.log("Subscribed successfully as probe topic" + topic.toString());
                            if (futurecb[portid]) futurecb[portid]();// check point to goon later when we want the gp ctl 
                        }
                    });
                } else return false;// error 

           } else if (isprobe && clas == 'probe') { 

                // just set the topic x the probe according to protocol 
                if (protocol == 'shelly') {
                    topic='ctl_probe_' +subtopic;
                    client.subscribe(topic, shelly_options, function (err) {// in bash do : mosquitto_sub -t shellies/shelly1-34945475FE06/relay/0 -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                        if (err) {
                            console.log("An error occurred while subscribing shelly")
                        } else {
                            status[portid] = [];// LLPP : init array, so now is subscribed , was null (no subscribed)
                            console.log("Subscribed successfully as probe topic" + topic.toString());
                            if (futurecb[portid]) futurecb[portid]();// check point to goon later when we want the gp ctl 
                        }
                    });

                }
            }
            if(topic){mqttnumbTop[portid]=topic;invTopic[topic]=portid;}// complete cfg to easier/better dev management !
        });


        client.publish("testtopic", "test message", opt);// send msg with testtopic topic for debug

    };
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

let fc= function (gp,ind,inorout,cfg){// mqtt gpio constructor new fc will return the io ctl
                                        // inorout=iotype=clas='out'/'in-var' , nb  clas in doSomethingAsync is not this.clas
                                        // PIRLA   returns {gpio,devNumb=portid,type=inout,cfg,cl=1(clas='out')/2(a var)/3(clas='in'OR'prob'),ison,readsync,writesync}
                                // type = old :  inorout is the dev type or capability requested ,must match the config data got in init()
                                //        new :  can be 'out' for gpio like relais (cfg in mqttnumb) or 'in-var' for mqtt probes/var (cfg in mqttprob)
                                //  update : if clas/inorout='out', now we can also  have rele/pump dev ,and also var device with similar  config data  as mqttprob[i]
    this.gpio=gp;// gp: the mqttnumb/mqttprob.portid as number of the device  io ctl
    this.devNumb=ind; // the associated array  item index  as displayed in browser  and for mqttnumb case the index  in relaisEv/relais_ 
    this.type=inorout;// >>> 'out' for rele configured in mqttnumb, or in-var for probes/vars configured in mqttprob. tells where is the cfg and if is relais or probs/vars
    this.cfg=cfg;//  >>>> mqttnumb/mqttprob item  depending on inorout

    // this time clas is integer , bad name !, confusing , , nb  clas in doSomethingAsync is not this.clas, is not mqttprob.clas !!!!!!!!!!!!!!!!!!!!
    if(this.type=='out'){
        if(cfg.clas='out')this.cl=1;// rele in mqttnumb (valued updatable in browser !)
        else this.cl=2;// a var in mqttnumb[i] of name relaisEv[i]
    }else if(cfg.clas=='in'||cfg.clas=='probe')this.cl=3;// probe
    else this.cl=4;// var in mqttprob (no visibility in browser)
   
   //
    if(status[gp]
        // todo && devtype[gp].contains(type)
        ) this.isOn=true;// is subscribed ! (at least status[gp] =[], see LLPP)  . so can readSync coming values !!
   //
     else this.isOn=false;

    // return this ! if .isOn the ctl is active

}
fc.prototype.readSync =// dont need  async 
                        function (){
    // in case of a previous write the msg queue is cleared so the effect of a write can be read also waiting some time !
    let gp=this.gpio;// portid
    if(status[gp]&&client.connected//if(gpio[gp]&&client.connected
        // &&status[gp]
        ){// still registered, subscribed, connected 
    let resolRead;

    resolRead=getgpio(gp,this.cl);// get last queue entry when available in a short time (< maxtime)
    console.log('mqtt readsync read value from queue or listener, promise : ',resolRead);
            return resolRead;// nb resolve value must be 0 or 1 !!!
    }else return Promise.resolve(null);// data not available

}

fc.prototype.writeSync = function (val) {// val 0/1, can return false if in error 
    // will send a topic KKUU as registered in init() conf data for the device 
    // todo : in dev config data we can mark a dev if is available for out (a shelly 1 relay) or 'in' a HT device
    let gp = this.gpio;// portid
    if (//gpio[gp]&&
        client && client.connected && status[gp]) {// registered, subscribed, connected . in type wont write anything

        let message;

        if (this.cl == 1) { // a rele/pump inorout='out'   see mqttnumb set

            if(this.cfg.protocol=='shelly')
            if (val == 0) message = messageOff; else message = messageOn;


        let pub_topic = shelly_stopic + this.cfg.subtopic+ shelly_topicpp;// KKUU calc the topic to send from config (according to dev type): shellies/ + <model>-<deviceid> + /relay/0/command  


            // in future we get the topic from 


            // clear msg queue ( and its listener ? must be rejected ????)
            // WARNING hope a message in transit dont get here meanwile !!!!
            status[gp].length = 0;

            client.publish(pub_topic, message, pub_options, function (err) {
                if (err) {
                    console.log("An error occurred during publish on dev: ", gp);
                    return false;
                } else {
                    console.log("Published successfully to " + pub_topic.toString());
                    return true;
                }
            });

        } else if (this.cl == 2) {// a var in mqttnumb[i] 


            message = val;

            let { topic, varx, isprobe, clas } = this.cfg;
            //topic_=topic;
            let topic_ = 'ctl_' + topic + varx;// warning we add ctl_   !!!!

            client.publish(topic_, message, pub_options, function (err) {
                if (err) {
                    console.log("An error occurred during publish on dev: ", gp);
                    return false;
                } else {
                    console.log("Published successfully to " + pub_topic.toString());
                    return true;
                }
            });

        }else if (this.cl == 4) {// a var in mqttprob[i] 


            message = val;

            let { topic, varx, isprobe, clas ,protocol} = this.cfg;// protocol:'mqttstate'
            //topic_=topic;

            if(protocol=='mqttstate'){// si applica la regola std  per settare il topic x le variabili che metto in mqtt!
            let topic_ = 'ctl_' + topic + varx;// warning we add ctl_   !!!!

            client.publish(topic_, message, pub_options, function (err) {
                if (err) {
                    console.log("An error occurred during publish on dev: ", gp);
                    return false;
                } else {
                    console.log("Published successfully to " + pub_topic.toString());
                    return true;
                }
            });}
            else return false;// cant write to unknown proto 

        }else if (this.clas == 3) {// a probe in mqttprob[i] . a prob cant write |||||||||||||||||  sodo  return true
            return true;
    } else return false;// return false if error
}else return null;// cant write
}


module.exports ={// returns ...
    avail:null,// null, true,false th connection to broker is ok
    // use : await read()

    init:function(plantconfig){// wait connection and subsribe all gpio x plantconfig, 
                                                    // so  as soon cb is called we have status[gp]=[] (the subscription is ok )

                                                    //  old :  'gpio_11':[[id,topic],,,,,,]}){//console.log('rest init : load http: ',http_);
        // let{mqttprob_,devid_shellyname}=plantconfig;    //  let{gpionumb,mqttnumb,mqttprob,relaisEv,devid_shellyname}=plantconfig;
        let gpio=null;// not used // deleted : gpio=plantconfig.devid_shellyname||{11:'shelly1-34945475FE06'}; 
        mqttnumb=plantconfig.mqttnumb,
        mqttprob=plantconfig.mqttprob;// prob + var state cfg array
       // for(dev in gpio){
        for(let i=0;i< mqttnumb.length;i++){
       // status[dev]=null;// queue ** su topic shellies/<model>-<deviceid>/relay if array is null means no connected 
       let dev=mqttnumb.portid;
       futurecb[dev]=null;// it will be filled by the request of a dev ctl
       status[dev]=null;// not subscribed jet !
       statusList[dev]=[];// init list arrays
       }
       //for(dev in mqttprob){
        for(let i=0;i< mqttprob.length;i++){
            // status[dev]=null;// queue ** su topic shellies/<model>-<deviceid>/relay if array is null means no connected 
            let dev=mqttprob.portid;
        futurecb[dev]=null;// it will be filled by the request of a dev ctl
        status[dev]=null;// not subscribed jet !
        statusList[dev]=[];// init list arrays
        }
       //if(client.connected)return true; else return false;
       if(start()){
        this.avail=true;// connected to broker, wating for all dev subscription cb
        return this;
       }else {
        this.avail=false;
        return null;
       }
    },
    fact:function(gp,ind,inorout='out'){// // gp=portid,ind=0,1,2 index of mqttnumb or mqttprob depending on inorout !! (***)
                                        // PIRLA: >>  return promise resolving in  {ctl:new fc(gp,ind,inorout,cfg)={gpio=portid/devid,devNumb=index,type=inout,cfg,cl=1(clas='out')/2(a var)/3(clas='in'OR'prob'),ison,readsync,writesync},
                                        //                                      ex: ctl={cfg={portid,clas protocol,subtopic},cl:1,devNumb:0,gpio:11,isOn:true}
                                        //                                   devNumb:ind,
                                        //                                   type:'mqtt'}  (=pr)  

                                        //              when we got the subscription (status[gp]!=null) on dev topic using dev info loaded in 
                                        //    inorout definisce/punta alla cfg del dev che puo essere tipo  rele/out o var-in (cfg in mqttprob )       
                                        // a factory, usually returns a obj, but as our obj is the resolve of a promise the caller of the fact  must await or thenable that promise return 
                                        // inorout is the dev type or capability requested ,must match the config data got in init()
                                        //          can be out for gpio like relais or in-var for mqtt probes/var 
                                        //          say where find cfg in model (***) and how to build the dev ctl
                                        // the promise resolves in {ctl:new fc(gp,ind,inorout),devNumb:ind,type:'mqtt'}
                                        //                  after device number gp  is subscribed in start() using : client.subscribe(sub_topic, shelly_options, function....)
                                        //                      setting status[gp]=[]
                                        //                          nb sub_topic is got fron cfg data gpio set in  init:function(gpio_={11:'shelly1-34945475FE06'} called in fv3:
                                        //                                  if(!(isAvail=mqtt.init(devid_shellyname)
                                        //                                         let{gpionumb,mqttnumb,mqttprob,relaisEv,devid_shellyname}=plantconfig;
                                        //                                          plantconfig=eM.state.app.plantconfig; (set in loadScriptsFromFile , plantconfig=model.getconfig(plant_) )

                                        //                  infact the device is usable if the mqtt server recognise a topic it can serve so cb the subscrition requested
                                        //                  the subscribing request for a gp dev ask for a topic = shelly_options. it done in init() 
                                        //   
        let res_,
        cfgf=mqttnumb;if(inorout!='out')cfgf=mqttprob;// (***)
        let cfg=cfgf[ind];// dev cfg from model,
                                                // {portid:110,clas:'var'/'out',  
                                                // if 'out'  +
                                                // protocol:'shelly',subtopic:'shelly1-34945475FE06',
                                                // if !'out'  +
                                                // topic:'gas-pdc',varx:3,isprobe:false}


        return new Promise((res,rej)=>{// resolved in  a dev ctl  

            if(status[gp]){// is already subscript by ......., as the subscript cb is called and set status[gp]
                console.log(' factory is resolving the dev (',gp,') ctl as it is alredy subscribed');
                res({ctl:new fc(gp,ind,inorout,cfg),// depend on inorout the model cfg is different (see  mqttnumb,mqttprob in plantconfig)
                    devNumb:ind,type:'mqtt'});
            }else{// register a resolver when the cb will come
                console.log(' factory is setting the subscribing cb to give the dev ctl , dev:',gp);
                futurecb[gp]=function (){// when this func will be called (by subscription cb )we resolve giving the device ctl
                    res({ctl:new fc(gp,ind,inorout,cfg),devNumb:ind,type:'mqtt'});
                }
            }
        })

    }
}


