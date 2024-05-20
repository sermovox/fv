let TEST=null,
outprompt='>>>>>>>>>>>> please input :  lights,turn_on,light.my_light to change entity related to dev in ha associated to plant: ';

let readline=null;// not used in production 
// const readline=readline_;// only debug 
const DoTestonHa=true;//debug only
if(DoTestonHa){TEST=test_;
  readline= require('readline').createInterface({// see https://stackoverflow.com/questions/65260118/how-to-use-async-await-to-get-input-from-user-but-wait-till-entire-condition-sta
    input: process.stdin,
    output: process.stdout,
  });
}

// move to the end
function test_ (docmd_,plant){// a plant that want to run test must call this, if is the first register docmd_ (really the anewcon obj) in docmd
                              // it returns doinp that fills anewcon.test
  if(docmd==null){
   outprompt+=plant;
    docmd=docmd_;
    return doinp// so if the plant is the first to set test we return the entry point to repeat the request x another test on the plant
  }else return undefined;

  function requestInput(shown) {// use :
    // in async  await requestInput
    // otherwise use a cn :  requestInput.then(goon);

    return new Promise((resolve, reject) => {
      console.error(shown);
      readline.question(shown, async (url) => {
        console.error('readline got line', url);
        //readline.close();
        resolve(url);

      });
    });
  }

  function doinp(){ 
    console.error(' ****** trying to get input to run test on ws ha commands, so prompt with:',outprompt); 
    requestInput('>>>>>>>>>>>>  ',outprompt).then(readin);// old,  debug, if we were in a async we could : await  requestInput()
  }
  function readin(read_) {// old not to call , cant see the instance
    let reads = read_.split(" ");
    console.error(' >>>>>> user send data to fire a ha cmd , was: ',reads); 
    docmd.docmd('null','testing',...reads);// reason testing so after a succeeded feedback restart a new reading x testing
  }
  }








// import hass from "homeassistant-ws";
//import * as hassImp from 'homeassistant-ws';
// const hass = hassImp.default;
let connCfg
  ={  // def cfg ..... LLHH resolve with clientobj=clientObject(client)
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJiNmYxMDk3NDYxODI0YmZhYjkwNTc2NjQ1ZDVmODU4MyIsImlhdCI6MTY5NDQ0Mjg2MiwiZXhwIjoyMDA5ODAyODYyfQ.ppeuf-Ma1vLVQCT0Qrt07C5TXGHsHasX3ElOl1NCX3A', 
  host: '192.168.1.212',
  port: 8123,
  };
    /*connCfg={  // ..... LLHH resolve with clientobj=clientObject(client)
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJiNmYxMDk3NDYxODI0YmZhYjkwNTc2NjQ1ZDVmODU4MyIsImlhdCI6MTY5NDQ0Mjg2MiwiZXhwIjoyMDA5ODAyODYyfQ.ppeuf-Ma1vLVQCT0Qrt07C5TXGHsHasX3ElOl1NCX3A', 
    host: '192.168.1.212',
    port: 8123,
    }*/
let PRTLEV=3;// a context set by fv3. to pass to hawsclient !


  const ON='turn_on',OFF='turn_off';

// if we install locally: const hass=require("homeassistant-ws");// to install : npm -i homeassistant-ws .... see YYKK 
const hass_=require("../../homeassistant_new/node_modules/homeassistant-ws/build/index_haws.js");// install and modify node_modules/homeassistant-ws/build/index.js in a specific directory homeassistant-new

// hass_.setctx(PRTLEV);
// or 
                                                                                          // follow https://www.geeksforgeeks.org/how-to-install-a-local-module-using-npm/:
                                                                                          // cd .../raspexample & npm install ./nodeassistant-ws
                                                                                          //    to install in loc dir  ./nodeassistant-ws then modify the index.js as above

                                        // hass is the exported function createclient in  homeassistant-ws-vxx package index.js  
                                        // clientobj= hass() is a promise resolving with ( see  LLHH) :
                                        //    clientObject(client)=  {  rawclient=client={ seq: 1, options, resultMap: {}, emitter: ws: options.ws(options)},
                                        //                              getStates,getServices,getPanel,getConfig,on,callService,fireEvent,,, 
                                        //                            }
                                        //  using  "isomorphic-ws" package ( NOT 'ws') we got the connected ws obj  : client.ws=require("isomorphic-ws")(ws://localhost:port/path) 
                                        //          >>> NOT the ws=require('ws')() !!!!   ex: websocket ws.on('close',handler) >>  begin isomorphic-ws ws.onclose(handler)
                                        //                                                but the event handler was pass-throught to client.on('ws-close',handler)
                                        //          nb the isomorphic-ws connected  obj is:  (client=await hass()).rawclient.ws , try not using it !
                                        // 





// console.log('ciao');

// if(client)main();

// async 
function getNewCon(cfg_,PRTLEV){// called by : async function kepAlive(reset=false)

  let clientInst;
if(cfg_)connCfg=cfg_;// only first call set the conn param 
      // Establishes a connection, and authenticates if necessary:
if(connCfg&&connCfg.token&&connCfg.host&&connCfg.port){
 //  client 
  clientInst=// await 
    hass_(
    /*connCfg={  // ..... LLHH resolve with clientobj=clientObject(client)
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJiNmYxMDk3NDYxODI0YmZhYjkwNTc2NjQ1ZDVmODU4MyIsImlhdCI6MTY5NDQ0Mjg2MiwiZXhwIjoyMDA5ODAyODYyfQ.ppeuf-Ma1vLVQCT0Qrt07C5TXGHsHasX3ElOl1NCX3A', 
    host: '192.168.1.212',
    port: 8123,
    }*/
    connCfg,
    PRTLEV
   );
   // old: ws=client.rawClient.ws;// clientobj.ws ,  in  "isomorphic-ws"  we got the connected ws obj  : clien.trawClient.ws=require("isomorphic-ws")(ws://localhost:port/path) 
                          //    seems == to require("ws")(ws://localhost:port/path) in nodejs

   // console.log('ciao mondo :\n',JSON.stringify(client));
  }
  return clientInst;// return a promise
}


async function main(client) {// call in a connected client to init/restart the initial state inState
    // client can get null when after  connection lost
    if(client==null)return;

      // Get a list of all available states, panels or services:
  client.inState=await client.getStates();// store initial state values
  console.log(' hawsclient: main()  restart new client tracing state, events  ');
  if(PRTLEV>8)console.log(' hawsclient: main() inital states are: ',client.inState);

  /*
  await client.getServices();
  await client.getPanels();

  // Get hass configuration:
  await client.getConfig();
*/

  // Listen for all HASS events - the 'message' event is a homeassistant-ws event triggered for
  // all messages received through the websocket connection with HASS:
  //
  // See https://developers.home-assistant.io/docs/api/websocket/ for details on HASS events:
  client.on('message', (rawMessageData) => {
    if(PRTLEV>4)console.log('hawsclient.js:  ha ws raw message received from ha: ',JSON.stringify(rawMessageData,null,2));
  });

  // Listen only for state changes:
  client.on('state_changed', (stateChangedEvent) => {
    console.log('hawsclient.js:  ha ws state_changed event received from ha.  entity : ',stateChangedEvent.data.new_state.entity_id, ', new state: ',stateChangedEvent.data.new_state.state);
  });

let ex=false;
    let outprompt='>>>>>>>>>>>> please input :  lights,turn_on,light.my_light ';
    console.error('now start requesting iterately: ',outprompt);

    // just x debug doinp();

  function doinp(){  requestInput(outprompt).then(readin);// old,  debug, if we were in a async we could : await  requestInput()
  }
  function readin(read_) {// old not to call , cant see the instance
    let reads = read_.split(",");
    docmd('null','null',...reads);
  }
  /* moved
  function docmd(...reads){// cmd,...arguments call ex: docmd('ser','switch','turn_on','switch.rssi') docmd('ser','python_script','set_state','switch.rssi','on')
    if (reads[0] == 'exit') console.error('Call a cmd, ends');
    else if (reads[0] == 'ser') {
      // Call a service, by its domain and name. The third argument is optional.
      console.error('Call a service, by its domain and name. The third argument is optional:', reads);
      if(reads[2]=='turn_on'||reads[2]=='turn_off'||reads[2]=='set_state'){//  available service
        let data={// domain,name data={ entity_id: reads[3]
          //  ,state:'the new value'}// if domain=
          entity_id: reads[3]
          }
        if(reads[2]=='set_state')if(reads.length>4)data.state=reads[4];else return;
      client.callService(reads[1], reads[2], data).then(doinp);}
    } else if (reads[0] == 'event') {
      console.error('fire event, by type, data :', reads);
      let data = {}; data[reads[2]] = reads[3];
      client.fireEvent(reads[1], data).then(doinp);
    }
  }*/

  function requestInput(shown) {// use :
    // in async  await requestInput
    // otherwise use a cn :  requestInput.then(goon);

    return new Promise((resolve, reject) => {
      console.error(shown);
      readline.question(shown, async (url) => {
        console.error('readline got line', url);
        //readline.close();
        resolve(url);

      });
    });
  }
}// end main
function getState(){

}
let ws,// the current ws if active, got from client.rawClient.ws
wsArr;// the ws in fv3 ??
//client=null,
//Actstates=[],//  list of tracked entities in inState ex: ['switch.rssi',,,]
              // the updated ha state list  we want to trace, can be :
              // reviewing.........    are state, devices or its topics (topic,pubtopic,cmdtopic ) ???
              //  - switch state (pubtopic,topic state is only to check what the switch is doing and can be avoid) or 
              //  - probe state : topic only
              //  - switch buttonpress (cmdtopic)event







//inState=null,// the updated state of Actstates: if null means there is no connection active, 
            // if entity isnot in Actstates is not updated !
            // it will be init with state at connection time , then when we add a dev queue  add Actstate and 
            // add state-change handler that 
            //  - at next update updates Actstates and call ctlcb to fill the queue 
            //    we can use the present inState if  reset inState=await client.getStates(); then :
            // - we can call ctlcb, just after the add queue request, to send present value
//ctlcb=null; // calls msgList(topic,msg) , the fv3 income process handler of msg on suscribed/expecting topic : this.msgHand(topic,val)=msgList 
            //    issue  val on topic topic to the message handler:  msgList
            //    the cb function to fill fv3 Actstates cmdtopic/interrupt ( queue not interesting) for type 1,2
            //                                      topic ovvero queue per type=3
            //    so x topic and cmdtopic
// ctlComTopic=null;// cmdtopic entry point 

// after ai init : kepAlive();

async function trackEnt_old(ent) {// check that the entity is registered x tracking in inState[entity] the current updated value (set with onchange listener)
  if (Actstates.indexOf(ent) < 0) {// the entity is not registered to have its current value in  inState ! so rehister  

    client.on('state_changed', (stateChangedEvent) => {// add a listener x future changes . here checks the dev related entity (haEntity,haManButton) that fire topic and cmdtopic x this dev 
      // really , instead to add a (ent change)listener x each interested entity , we could have just 1 listener that check all entity for all devs 
      let msgtopics;// the msg x cmdtopic issued by this dev of type 2 : 

      // >>> when the entity (button ) get pressed its current state is registered on inState[ent] 
      if (stateChangedEvent.data.entity_id==ent) {// >>>>>>>>>>>>>    entity var or id ???????????   changes on cmdent entity 
        // check is entity_id like switch.rssi   ???????
        inState[ent]=stateChangedEvent.data.new_state.state;


      } else return null;// 

    });
    return inState[ent]=(await client.getStates())[ent];// store initial state values

  }// else;   if the entity is alredy registered for updates ,  do nothing !
}

async function trackEnt(ent) {// check that the entity is registered x tracking in inState[entity] the current updated value (set with onchange listener) after had initialzed complete state in inState
  if (Actstates.indexOf(ent < 0)) {// the entity is not registered to have its current value in  inState ! so rehister  

    client.on('state_changed', (stateChangedEvent) => {// add a listener x future changes . here checks the dev related entity (haEntity,haManButton) that fire topic and cmdtopic x this dev 
      // todo : really , instead to add a (ent change)listener x each interested entity , we could have just 1 listener that check all entity for all devs 
      let msgtopics;// the msg x cmdtopic issued by this dev of type 2 : 

      // >>> when the entity (button ) get pressed its current state is registered on inState[ent] 
      if (stateChangedEvent.data.entity_id==ent) {// >>>>>>>>>>>>>    entity var or id ???????????   changes on cmdent entity 
        // check is entity_id like switch.rssi   ???????
        inState[ent]=stateChangedEvent.data.new_state.state;


      } else return null;// 

    });
    // return inState[ent]=(await client.getStates())[ent];// store initial state values

  }// else;   if the entity is alredy registered for updates ,  do nothing !
}

function updateState(entity=null){// will call the ctl cb to fill fv3 queue   old delete
  if(ctlcb==null) return;
if(entity==null){
 for(ent in Actstates){
  ctlcb(ent,null);// fill ent queue with null: no connection 
  }}else {
    ctlcb(ent,inState[ent]);
  }
}

let Fact=function(ctlcb_,cfg_,PRTLEV_){// return the anewcon=connector obj (to be completed):
                                        //  {cfg,client,ws,setSwitch,Actstates,inState,ctlcb,kepAlive,onReset
                                        //        docmd,docmd_            // funzioni alternative, todo: docmd_da utilizzare al posto di un this.docmd added as func in BBHH : bastta scambiare i nomi   docmd_  <>   docmd 
                                        //  } // TTHH
this.cfg=cfg_;// plantconfig
this.client=null;
this.ws=null;
this.PRTLEV=PRTLEV_;
this.Actstates=[];//  list of tracked entities in inState ex: ['switch.rssi',,,]
              // the updated ha state list  we want to trace, can be :
              // reviewing.........    are state, devices or its topics (topic,pubtopic,cmdtopic ) ???
              //  - switch state (pubtopic,topic state is only to check what the switch is doing and can be avoid) or 
              //  - probe state : topic only
              //  - switch buttonpress (cmdtopic)event



this.inState=null;// the updated state of Actstates: if null means there is no connection active, . nb when recennecting inState could not receiving some update from ha !!!!!!!!!!!!!!!!!!!!!!
            // if entity isnot in Actstates is not updated !
            // it will be init with state at connection time , then when we add a dev queue  add Actstate and 
            // add state-change handler that 
            //  - at next update updates Actstates and call ctlcb to fill the queue 
            //    we can use the present inState if  reset inState=await client.getStates(); then :
            // - we can call ctlcb, just after the add queue request, to send present value
this.ctlcb=ctlcb_; // calls msgList(topic,msg) , the fv3 income process handler of msg on suscribed/expecting topic : this.msgHand(topic,val)=msgList 
            //    issue  val on topic topic to the message handler:  msgList
            //    the cb function to fill fv3 Actstates cmdtopic/interrupt ( queue not interesting) for type 1,2
            //                                      topic ovvero queue per type=3
            //    so x topic and cmdtopic
this.onReset=function(){console.error('hawsclientFact: onReset, error in haws connection , is resetted')};// the cb to warn haWs that this instance reset the client and ws properties. todo some recovery
// try to set test on ths plant ha
this.test=null;

}

Fact.prototype.docmd_=function (topic,reason,...reads){
  
                                                      // alternativa a this.docmd che  alla data 01052024 rimane quella  di rif . qusta alternativa non è aggiornata 
                                                      // alternative to use the func added without prototype. if use this , portare a livello delle correzioni nell'altra funzione
                                                      // cmd,...arguments call ex: docmd(topic,reason,'ser','switch','turn_on','switch.rssi') docmd(topic,reason,'ser','python_script','set_state','switch.rssi','on')
  if(PRTLEV>5) console.log('docmd(), preparing ha ws callService: ha ws command called on topic: ',topic,' reason: ',reason,' action: ',reads);
   if (reads[0] == 'exit') console.error('Call a cmd, ends');
   else if (reads[0] == 'ser') {// ha ws api: command call , can be : call_service command or 
     // Call a service, by its domain and name. The third argument is optional.
     // console.log('docmd(), Call a service, by its domain and name. The third argument is optional:', reads);
     if(reads[2]=='turn_on'||reads[2]=='turn_off'||reads[2]=='set_state'){//  available service
       let target,data={// data=service_data={entity_id} , check : hs developers websocket API, calling a service
         // domain,name data={ entity_id: reads[3]
         //  ,state:'the new value'}// if domain=
         entity_id: reads[3]
         },service=reads[2];
       if(reads[2]=='set_state'){if(reads.length>4)data.state=reads[4];else return;// reads[1] must be 'python_script'. 
                                                                                   // can also set attributes , see https://community.home-assistant.io/t/how-to-manually-set-state-value-of-sensor/43975/3?page=6
                                 // data={entity_id,state,attrib1,attrib2,,,}, so extract attrx from reads[5]
                                 if(reads[5]){// read[5]={attrib1,attrib2,,,}
                                   for (item in reads[5])data[item]=reads[5][item];
                                 }
                               }// service_data={entity_id,state}
        else {target=data;  // or target=reads[3]; ?  // if the request reads[2] is turn_on/turn_off
        // data=undefined;
          }
       // target={entity_id:'light.kitchen'=entity_id=reads[3]}; here or in service_data??? check api: seems in target
       // if(reads[3]=='switch.rssi')service='turn_on';// debug
       if(PRTLEV>7) console.log('docmd(), calling callService, params:  ',reads[1],service,data,target);
     this.client.callService(reads[1], service, data,target)//  question is client still connected ? , data=service_data
      .then((response)=>{
       if(PRTLEV>7)console.log('ha ws callService succeeded on action: ',reads);}
       ,(err) => { 
         console.error('ha ws callService not succeeded on action: ',reads,' with error: ',err); 
         console.log('ha ws callService not succeeded on action: ',reads,' with error: ',err); }
       ) // dont need the async cb 
       ;}
   } else if (reads[0] == 'event') {
     console.error('fire event, by type, data :', reads);
     let data = {}; data[reads[2]] = reads[3];
     this.client.fireEvent(reads[1], data)
           .then((response)=>{if(PRTLEV>8)console.log('ha ws fireEvent succeeded on action: ',reads);}) // dont need the async cb 
           ;
   }
 
 
 }


Fact.prototype.setSwitch=function(ctlpack,topic, topicNodeRed,pubtopic){// called in numbsubscr/probsubscr  registerIncomeInfo()
// if(this.client)this.client.setSwitch(ctlpack,topic, topicNodeRed,pubtopic);// client set with kepAlive()

// setSwitch:function (ctlpack,topic, topicNodeRed,pubtopic){// moved to Fact()
const client=this.client;
// this.ocmd=this.docmd.bind(this);// so use docmd() , easier then call this.docmd()in all reference below docmd()    see BBHH,    BBHH1
                                // or docmd=this.docmd_.bind(this);

  // *** use fv3 device topics(topic,pubtopic,cmd topic) that interfaces fv3 with real device to interface related ha entity and its triggers,changes
  //      returns the ha topic/pubtopic trigger handler 
//                         type 1 :the ha entity control the real devices usually with same topics . 
//                                    so we must relay the fv3 topics to :
//                                      - transmit the fv3 pubtopic to real device  . this is achived changing ha switch state after received pubtopic from fv3 
//                                            infact when writesync: fv3 publish to (topic/) pubtopic ( so not call fv3 handler msgList(topic,val) that is subscribed only to topic and cmd topic ) and 
//                                                                    fire a ha setstate service to associated switch entity (via  writeWs func ha handler of pubtopic x this dev ) 
//                                      - dont need to transmit back the real ha topic coming from real device  to fv3 
//                                     and transmit the cmd topic from the dedicated button entity  to send external cmd to managed device  by interrupt handler 
//                                            thats calling ctlcb(topic,val) that will call the msg handler : msgList(topic,val) 
//                          type 2/4 :the ha entity monitor the fv3 published topic  
//                                     and transmit the cmd topic from the dedicated button entity  to send external cmd to var device managed by interrupt handler
//                          type 3  : ...........



//      obsolete:
//  * ha >> fv3 :
//    - (type 3,4?) : add a ws listener for the state-changed entity (button/switch) on associated ha entity to fill the corresponding dev queue  
//      or
//    
//    - (type 1,2):  from associated ha cmd topic button entity send a cmdtopic to fv3 message handler the will issue a interrupt to specific user interface ws handler 
//       that will set a manual(user/external request/cmd) algo object  

//          >>> nb fw3 type 1,2 dev dont receive dev topic from ha, because not interested
//              , so device income goonP() cant fill dev queue 
//          but the proposal to  fv3 to change dev state (event from user int like ws)  must be done as cmd topic and managed throught interrupt calling associated browser ws handler

//  * fv3 >> ha 
//  - will return the writeWs func to call from writeSync to trigger ha associated switch change process (usually call a setstate service)
//    the name dev will be mapped to ha entity ent provided by customer in models numbSubscr,,, or something else

//  nb from fv3 , ex from models.js we get the associated ha entity and its cmd topic entity
/* remember ctlpack= {ctl:new fc(gp,ind,inorout,cfg,that),devNumb:ind,type:'mqtt'}

*/

// let entStates=null;// hass......    todo point to state traced by hass , ex entStates['switch.rssi']='on'
let ctl=ctlpack.ctl,//
plantconfig=ctlpack.plantconfig,// the plant cfg
url;
let {topicMsg,cmdtopicMsg,cfg}=ctl;// cfg is the dev config
let portid=ctl.gpio,// dev portid
devind=ctlpack.devNumb,// dev index;
type = ctl.cl;// 0,1,2,3,4 , used to .....
portid==0?url='':url='setMan';// cmdtopic url setMan excluding portid 0 



// let {eventMng='mqtt',haEntity,haManButton,package,dashboard}=cfg;// cfg =plant.mqttnumb/mqttprob[dev], the dev cfg

// ??
let {eventMng='mqtt',
haEntity,haManButton,// used to fire cmdtopic to fv3 , use a std cmdtopic msg format (PPLL) 
// state, // used in state dev: portid==777, to update ha entities using a proper msg format on topic msg
custF // new custF staff injected
}=cfg;// todo : ** are recovered on cfg=ctlpack.ctl.cfg=plant.cfg.mqttnumb/mqttprob[dev], the dev cfg, 
// ctlpack.ctl.cfg.haEntity is the ha entity related to device with portid :  portid=ctlpack.ctl.gpio,
// nb  only device that are relayed on user ha can have haEntity,and (no probe ) haManButton
// haEntity is the target of topic or pubtopic 
// haManButton event are source of cmdtopic msg to fv3
// state only for portid=777
let state_=cfg.state;// better rename cfg attr state > state_ . state directives
/*
when add a plant for a user we add a basic info in models.plants ,
the user can register giving info:
- its hw connected relay to connect ex consenso e probes
- token per connettersi al ha del user via ws con questo modulo
a questo punto posso generare i file yalm in package e in dashboards via std obj (rispecchiano i file ora usati )che updato in funzione di  info
usandi il handler di app.post("/registerPlant/"  solo che riepio i package e dashboard invece che fare chiamata webhook 
ora qui posso trasferirli usando il sevice di trasferimento file che temporaneamente e' in configuration.yaml che il user deve aggiungere al suo configuration 
o in alternativa si copiera il pachage e il dashboard scaricabili durante la registrazione
see transYalm()

question: il supervisor ha per caso la capacità di leggere scrivere i file ??


*/

// 



let cmdent=haManButton,// >> the buttons entities to send the device a std format cmd topic  (not type 3) with a url (to address a handler specific entry points) :    PPLL
//  - if type=1,2,4  entity that fire cmdtopic in a msg with url  'setMan' : haManButton=[[entity,on/off]
//  - if type=0 the entity that fire cmdtopic in a msg  with url  'mqttxwebsock' and its event :
//                    : haManButton=[[entitytostartprogram,event='repeatcheckxPgm'],
//                                    [entitytostoprogram,event='stopcheckxPgm'],
//                                    [entitytostart.....,event='repeatcheckxSun",
//                                    ....
//                                  ],

//  >>>>>>>>>>  knowing the event in cmdtopicMsg we can complete the msg data with the data required by the receiving dev handler on the specific url : 
//          see:     cmdtopicMsg: async function (url, event = null, param = null, val_ = 0, entStates, trackEnt, user = 'extctlId')



/* >>>>>  ex ( see : function defFVMng(user,plant,localEntity) in models.js ): 
cfg.haManButton=[['input_button.setManx3hours_portid11','on'],// todo : ha entity firing event on url related to cmdtopic :setMan
],

cfg.haManButton=[['input_button.start_savingservice','repeatcheckxSun'],// entity firing event on url related to cmdtopic of this dev 
['input_button.stop_savingservice','stopcheckxSun'],
['input_button.start_progservice','repeatcheckxPgm'],
['input_button.stop_progservice','stopcheckxPgm']]


>>>>> attenzione qui si usano i button per sparare i cmdtopic, def in function defFVMng(user,plant,localEntity) in models.js 
tuttavia in interface si sono aggiunti anche dei automation che al trigger degli entity sparano un event
nel caso di problemi si potra usare tali event per sparare i cdmtopic al posto dei button entity . 


*/

ent=haEntity; //  ha entity   >>    fv3 dev : 
// type 3 dev (probe) :  the ha entity that send topic (not pubtopic or ) msg to dev income process (goonP) ,    PPLL 

// fv3 dev  >>   ha entity  : 
// type 1 dev : the ha entity to update on a pubtopic dev msg 
// type 2,4 dev, not portid=777 : the ha entity to update on a topic dev msg
// type 4 , portid=777 , a state dev , use state property , not this one !

//  ex: 'switch.rssi' , the switch entity to represent the dev state  PPLL 
/*

haEntity:localEntity.switch_consenso},// this dev has a ha entity related whose name is inserted on plant.localEntity
*/
if(PRTLEV>5)console.log('hawsclient setswitch registering listener ha statechange to catch cmdentity for dev portid:',portid);
// now 
// - foreach dev type we must simulate the mqtt message handler call client.on('message',msgList=function (topic, message, packet) 
//    that, using mqtt, would be pub on a topic from ha after a change on corresponding dev entity in ha (  entity( switch/sensor) ,cmd topic button x fire interrupt) on dev topic or cmdtopic
//    compreso il dev type 0 that is a dev that receives cmd topic whose interrupt call a subset of browser ws emit events
//    >> in pratica ha deve mandare via wsclient nel message handler msgList  gli stessi msg sui topic che i dev si aspettano usando il normale  mqtt client !
//        in sostanza i topics sono :
//              per il type 3 probe il  topic topic
//              per type 1  il pubcopy e il cmd topic (il topic non interessa)
//              per  il type 2 il topic e il cmd topic
//              per il type 0 il topic
// - return the handler to call when the dev writesync pub data on pubtopic(/topic): wsclient.publish()
//        must update same ent like in mqtt case the ha mqtt trigger set from a message on pubtopic/topic 
//       HHSS : will trigger update of entity ent when dev writesync call wsclient.publish(dev_pubtopic, data)
//            nb in state dev , portid=777 we fill many entities from state values, all must be mapped to the entity in the package cfg that must be cloned/downloaded/webhooked fron fv3 server
//            temporaneamente lavoriamo su fixed package , so name are fixed and do need to be mapped in cfg data (models.js)
//     >> il pratica i dev writesync sono pub su :
//                pubtopic (type 1) e vanno a controllare il device fisico in attesa di msg su pubtopic o 
//                vengono  cortocircuitati nel topic (type 2 e 4) , :
//                    - quindi alimentando il queue del dev via handler msgList su topic e/o 
//                    - osservato da chi e' eventualmente subscribed su tale topic (che e' solo ha nel caso di wsclient)
//                se uso wsclient devo quindi assicurare che i messaggi publicati da writesync assieme al loro topic  alimenti un handler (HHSS) 
//                    che sia in grado di updatare le entity associate al device
//                     es : triggerare azioni service o event firing
//                     nb l'hanler dovra nel caso di type 1 dovra gestire lo update del entity associata che essendo entity reale avra un nome customizzato che 
//                      potra essere inserito in models.js nella conf del dev
//                      ma potra come nel caso del dev state (type 4 , portid 777) updatare le var state che sono associate a altrettante entity che non dipendono dal plant
//                        costanti perche definite nella config del package associato
//                      a fv3 comprese le dashbord def.

if(type!=-1){// useless, any type, but some ent , cmd ent can be null 
// usually not all dev type has  a ha cmdent (button ) to send cmd topic , ex type 3
//  type 1 and 2 and 4 and 0  are usually not interested to track the topic state of real entity ent on ha
//  
//

/*
let hasent=false,hascmdent=false;
if(cmdent!=null) {if(Actstates[cmdent]==true) hascmdent=true;// already registered to trace cmdent state_changed event
else Actstates[cmdent]=true;} // aggiungo l'entity [] to trace all entities that can send this dev cmdtopic that are:
//  - if type=1 the entity that fire cmdtopic with url  'setMan' 
//  - if type=0 the entity that fire cmdtopic with url  'mqttxwebsock' and its event 
// es x consenso sara ent=switch.rssi e cmdent=input_button.setmanual_rssi_on_but
if(ent!=null) {if(Actstates[ent]==true) hasent=true;// already registered
else  Actstates[ent]=true;}
if(hascmdent&&hasent)return false;//  alredy processed 

// if want present value : 
//  inState=await client.getStates();// store updated  state values inState[name];// start tracking the state with t
//  ctlcb(name,inState[name]);

//   **  a) ha firing topics : depending on dev (use index or portid) fire  publish on topic (type 3 (probe), only ? ) or cmd topic ( type 1,2,4) 

// nb this client is the haws client homeassistant-ws, not the custom ws client wsclient in haWs!

if(!hascmdent)// ?
*/
//let probee;// is a probe

if(cmdent)cmdent.forEach((it) =>{let ent=it[0];this.Actstates.push(ent);});// register entities in cmdent as tracked 

// *****  haManButton  cmdtopic management: register a change listener that according with haManButton entity event will send a msg (cmdtopic format: url,event,value,....)  on dev cmdtopic 
if(cmdent||(ent&&type==3)){
if(PRTLEV>6)console.log('hawsclient setswitch() called to set listener for cmdtopic/topic from ha entities:',ent,'-',cmdent,'-',state_);
client.on('state_changed', (stateChangedEvent) => {// add a listener x future changes . here checks the dev related entity (haEntity,haManButton) that fire topic and cmdtopic x this dev 
// we could have just 1 listener that check all entity for all devs 
let msgtopics;// the msg x cmdtopic issued by this dev of type 2 : 

let finded,
entity_=stateChangedEvent.data.entity_id;// the entity that chnged state : usually a button press event
if(PRTLEV>7)console.log('hawsclient setswitch . listener for cmdtopic for entity: ',ent,' from entities ',cmdent,',\n   got statechange :',JSON.stringify(stateChangedEvent));
if(cmdent&&(finded=findCmdtopicEnt(entity_))>=0){//  the entity that fired its change is registered as this dev cmdtopic entity to send msg in cmdent array !

// PPLL when ha entity  change a dev (! type 3 ) val will send a cmdtopic with a msg on std format
//    depending on type we set automatically the url so that in income goonP() the correct interrupt handler will be chosen 
//          type 0 : url= 'mqttxwebsock'
//          type 1,2,4 url='setMan'
// >>>>>>>>>>>>>    entity var or id ???????????   changes on cmdent entity 
        // check is entity_id like switch.rssi   ???????
// this will use the  client = await hass() set up of a emitter interface subscription: client.on ( works after launched command  command({ type: 'subscribe_events' },  )
// but can also define a some additional triggers (see https://developers.home-assistant.io/docs/api/websocket/) like : 
//  setTrigger: async () => command({ type: 'subscribe_trigger' }, client),
/*
{
"id": 2,
"type": "subscribe_trigger",        // command FRTT
"trigger": {
"platform": "state",
"entity_id": "binary_sensor.motion_occupancy",
"from": "off",
"to":"on"
}
}


and , using a button will be :
.... {
"platform": "state",
"entity_id": "input_button.start_ensavings"
} ....


*/ 
// and manages the .onTrigger() (like we did with .on()  !!) checking the return of the command FRTT with its  id=2

let entity=entity_,// ok ?
event=cmdent[finded][1];// there is a entity entity that can send a topic to the dev interrupt handler to proces the event event

// ctlcb(name,stateChangedEvent.data.new_state.state);// B)


//             "topic": "@Casina_API@ctl_var_gas-pdc_4/NReadUser/cmd",
//     msg >>       "{\"payload\":1,\"sender\":{\"plant\":\"Casina_API\",\"user\":1055},\"url\":\"setMan\",\"checked\":1,\"data\":{{ states.input_number.hour.state}}}\n"


// ** here we have a to issue a dev cmdtopic msg. to fv3 income . it depende on dev type (?) and protocol because must be handle according to fv3 income handler 
//    so the msg x topic of a device is got by ctl.topicMsg=msgFormat.topicMsg;  and ctl.cmdtopicMsg
//  il dev avendo dichiarato haManButton sul dev mqttnumb significa che il entity haManButton è usato per emettere un cmdtopic msg che ha un format base che contiene
//  url che viene usato in goonP per cercare un handler registrato in una property ctl.int1 . l'handler lavora con msg con format base o uno esteso.
//  il msg viene creato da ctl.cmdtopicMsg che per costruire il msg (format base o esteso) ha a disposizione il context ctl che builda il msg per i 
//  url implementati (inserire handler, suo mappaggio in goonP, build del msg in cmdtopicMsg in msgFormat poi assegnato come property di ctl)

let url;
// >>>>  if a cmdtopic of a deve can fire more urls , add url to array in haManButton ex : 
//        cfg.haManButton=[['input_button.setManx3hours_portid11','on',url='setMan']],// 
type?url='setMan':url='mqttxwebsock';// set std url for dev type. url='mqttxwebsock' if type=0

//+/  Actstates cant contain all entity addressed on cmdtopicMsg  !! (url,event=null,param=null,val_=0,Actstates,trackEnt,user='extctlId'
this.inState[ent]=stateChangedEvent.data.new_state.state;// updates value, tracking the entity
if(PRTLEV>7)console.log(' hawsclient setswitch .state_changed  (button) reports an entity',entity,' update/pressed, so according to dev haManButton[], fire an cmdtopic event: ',event,' on url: ',url ,
',\n new value: ',this.inState[ent]);

// msgtopics=ctl.cmdtopicMsg(url,event,param=null,1,Actstates,trackEnt,user='extctlId');
msgtopics=ctl.cmdtopicMsg(url,event,param=null,ent,this.inState,user='extctlId',this.Actstates,plantconfig.Ent_Prefix);// >>>>>> according to url, event 'repeatcheckxSun' is fired by ha entity ('input_button.'+Ent_Prefix+'start_savingservice') 
                              // build the standard msg to send on dev cmdtopic    (>>>>>> see msgFormat.cmdtopicMsg())
                              //  ( so will be routed to a url/event entry point on the cmdtopic interrupt handler of the dev )
                              // nb event point to a procedure to calc the msg using plantconfig that has info about the ha entity name of the plant (knows the entity name prefix Ent_Prefix)
                              // all is specified by dev cfg  haManButton:                   HHGG
                              /*
                                      this.mqttWebSock=        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock',
                                          haManButton:[['input_button.'+Ent_Prefix+'start_savingservice','repeatcheckxSun'],// >>> entity start_savingservice firing event repeatcheckxSun, on url related to cmdtopic 
                                          ['input_button.'+Ent_Prefix+'stop_savingservice','stopcheckxSun'],
                                          ['input_button.'+Ent_Prefix+'start_progservice','repeatcheckxPgm'],
                                          ['input_button.'+Ent_Prefix+'stop_progservice','stopcheckxPgm'] 
                              */

                              // the payload, ha id, the url of the interrupt handler

this.ctlcb(topicNodeRed,msgtopics);// press of cmdent button will pub  new val on dev topicnodered=cmdtopic , so incoming process handler goonP() will receive val on the dev cmdtopic 
// this.queue.push(stateChangedEvent.data.new_state.state);// A)
// in mqtt int  we did : ......................

} else if(ent && stateChangedEvent.data.entity_id==ent){//ha entity send  dev topic msg: called only x probs (type 3). if ha entity want change a dev (! type 3 ) val will send a cmdtopic !
if(PRTLEV>7) console.log('hawsclient setswitch . ha entity ',ent,',transmit msg value to topic, only x sensor ....todo)  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state,
' so process in fv3 goonP listener');
// ctlcb(name,stateChangedEvent.data.new_state.state);// B)

// ** here we have a to issue a dev topic msg. to fv3 income . it depende on dev type (?) and protocol because must be handle according to fv3 income handler 
// msgtopics= "{\"payload\":1,\"sender\":{\"plant\":\"Casina_API\",\"user\":1055},\"url\":\"setMan\",\"checked\":1}";  // nb data is useless !

msgtopics=ctl.topicMsg(stateChangedEvent.data.new_state.state);// build/format the msg for the topics topic , msg is simply stateChangedEvent.data.new_state.state (a number )

this.ctlcb(topic,msgtopics);// // changes of ent will pub new val on dev topic , so incoming process handler will receive val on the dev topic 
// this.queue.push(stateChangedEvent.data.new_state.state);// A)
}
else  if(PRTLEV>7)console.log('hawsclient setswitch . listener for cmdtopic/topic for entity: ',ent,' found no matches');
})};



//   NOW :            fv3  >>>>>>>>>>>>>>>    sending device info to ha entities

// >>>>  ** now RETURN a function that will be used to update the ha entity related with the dev indipendentemente  of the topic/pubtopic but depending from dev type (not type 3)

// fv3 dev are write(d using writesync that pub a val on dev pubtopic to change the state of dev that gives values publishing on  dev topic:
//      .pub('pubtopic',val)
//          nb some dev type, like 2 ( not in  4 ? ) , pubtopic=topic so simulate a real switch device that pub on topic (so fill dev queue (the dev state)) just the val it was comanded using pubtopic
// in haWs we are using haws instead of mqtt, so we build a custom ws client (wsclient) that when .pub on a pubtopic/topic must change the associated ha switch like when it was done using mqtt:
//  >> so in wsclient when we .pub a topic we must do the same of the mqtt handler called becaused subscribed  on the dev pubtopic :
//      change the dev associated switch state !
//  so  on caller set :swclient.pubs[pubtopic]= the handler HHSS
//    that handler will be called when writesync calls wsclient.pub('thedev_pubtopic',val)

//   fv3  >>>> ha entities, sending device info to ha entities
// ** b) ha receiving  topics (topics=topic or pubtopic if type 1) from dev.writeSync(): depending on dev do action ( no : depending on topic or pubtopic ),
//       usually ha will fire event or switch service to change the entity state

let that=this;// set a ref for the obj's this 

if(type==1){// a relay/pump dev , a topics=pubtopic msg

// todo implement  on dev type or index .....

if(PRTLEV>6)console.log('hawsclient setswitch ,  setting the writeSync pubtopic handler to send  dev portid: ',portid,' msg on pubtopic to ha entity: ',ent,' (type 1) using ws docmd to send a change state service ');

return function myf(val,topic,state) {  // val is 0/1 (on/off) , topics= pubtopic
//              state is the eM.state just to get full state here
// this is the handler for coming msg (from fv3) of ha subscribed dev topics ( YYKK ), ( topics is topic if type 2,4 anf pubtopic if type1)
// as std mqtt case we can just updata the state of a mqtt switch or trigger a service from the coming mqtt msg topic 


// HHSS : will trigger update of entity ent when writesync pubs on  dev pubtopic for type 1 and on topic for type 2 and 4:
// in type 1 usually the ha entity ent is reading state from real device topic and pub on pubtopic to real device when we manually switch the device
// so this func will be called when client.publish('topic',val) call with topic= the registered pubtopic on this device , see XXFF  
//    here we come for msg of topics (pubtopic x type1 , topic x type 2 e 4 : check it ! )
//    now the problem is the msg will be on/off unless the portid 777 dev that is the state dev 

let act;
if (val=='on')act=ON;else act=OFF;
that.docmd(myf.topic,'new value on pubtopic','ser','switch',act,ent);// 
};// call f('switch','turn_on','switch.rssi'

}else if(type==2||4){/* topics=topic
val =msg={"payload":0/1,"sender":{"plant":"Casina_API","user":55}
so like in mqtt entity :  "value_template": "{% if value_json.payload == 0 %} \"0\" {% elif value_json.payload == 1 %} \"1\" {% endif %}",
*/
let det;
if(type==4&&portid==777)  det='for state entities: '+state_;else det='for ha entity: '+ent;
if(PRTLEV>6)console.log('hawsclient setswitch ,  setting the pubtopic handler to send  dev portit: ',portid,'writeSync msg (type 2/4) using ws docmd to send a change entity state service ',det);

return function myf (val_,topic,state) {  // x dev 777 , val is set in ioreadwritestatus:
const val=JSON.parse(val_);

if(type==4&&portid==777){// QQIIJK  portid=777  state dev: fill all std entity that depend on state var found on dev topic msg
// in this case the format of msg is an extendex format from the std format
// debug: topic should be @Casina_API@ctl_var_state_0
// use probmqtt state property to update entities when this dev will send a topic msg 

/* todo : a presence detector of 777 status connection
just add a timer that will set a flag servicenotactive that detect when program algo is working
when a 777 state arrives the timer is resetted 
when the flag becomes active we know that the service is unavailable so we should :
- do nothing : so the entities remain in the state of last 777 message
- activate a local temp ctl : in program algo non active interval off all rele, in active interval start a spare termostat
the spare termostat will check a condition on flag before trigger the action ! 
*/


/*
val.payload= state:{anticipate,// send to ha the status it expects      JJOOPP
program,
battery:new_scripts.aiax.battery,
inverter:new_scripts.aiax.inverter,
desTemp,// desidered temp , giorno only !
relays:new_scripts.relays// the pump browser state
}})


/* mosquitto_sub -t @Casina_API@ctl_var_state_0   -u sermovox -P sime01 -h bot.sermovox.com -p 1883
{"payload":{"state":{ "anticipate":true,"program":true,"battery":1,"inverter":0,"desTemp":20,
"relays":{"heat":false,"pdc":false,"g":false,"n":false,"s":false,"split":false,"gaspdcPref":false,"acs":true}
}
},
"sender":{"plant":"Casina_API","user":777}
}
// so no need to customize acs,battery,inverter,desTemp :

*/
// battery entity :

state_.forEach(el =>// for each  cfg.state  item  el  update the entity listed on  cfg.state , see GGUUNN, 
//            el=[ keycode,entityname]=
//            ['state.  program','input_text.'+Ent_Prefix+'pgmrun'],// * convertite true > 'ON'
//            ['sender.user','input_text.'+Ent_Prefix+'opt_service1'],
//            [state.relays.  acs,'input_text.'+Ent_Prefix+'acs'],  // * forse già usato solo come entity di acs pump: so useless 
{
let nval;// nb : convert boolean to string , let string , let number 
if (el[0] == 'sender.user') {
// used to set the entity el[1] on or off depending on msg.sender.user value (777 means not a classical user but the procedure that send the msg (like a url in a post))
// actually the el[1] dont exists .
/* remember in models.js what about the property y=state[i] in dev cfg:

// >>>>>>>>>  il func returned by setSwitch fillera le entity !  .    this non depend on cust def entity so just put here in the constructor
// - remember the msg built in QQIIJJ of ioreadwritestatus.js is :
//                                val=msg={ "payload":{"state":{"anticipate":true,"program":true,"battery":1.6,"inverter":0.5,"desTemp":20,
//                                                              "relays":{"heat":false,"pdc":false,"g":false,"n":false,"s":false,"split":false,"gaspdcPref":false,"acs":true}
//                                                                        }
//                                                    },
//                                          "sender":{"plant":"Casina_API","user":777}}

// this var dev will send a msg (see in QQIIJK of hawsclient.js) to set different ha entities ( different from haEntity is the ent to write the new dev values extracted from the std format for a var msg (payload))
//    - if y.[0]=state.x : the msg.payload.state.x value is used to set the entity y.[1]
//    - if y.[0]=sender.user   >  write to entity y.[1] ON/OFF depending on msg.sender.user value 

*/
// if(val.sender.user==777)......

}else if (el[0].substring(0,13) == 'state.relays.') { // [state.relays.acs,'input_text.acs'],  
        //is the pump index in mqttnumb
// convert relays tru/false to ON/OFF
let attr=el[0].substring(13) // attr='acs', val.payload.state= : see GGUUNN
//if(typeof state.relays[el[0]]=='boolean')
{ val.payload.state.relays[attr] ? nval = 'ON' : nval = 'OFF'; }
that.docmd(myf.topic,'state.relays. :'+attr,'ser', 'python_script', 'set_state', el[1], nval);// el[1]='input_text.'+Ent_Prefix+'acs'
// or  that.docmd(), above : that=this
}// entity like input_text !
else if (el[0].substring(0,6) == 'state.') {
let attr=el[0].substring(6) // attr='program'/'desTemp' , see GGUUNN
if (typeof val.payload.state[attr] == 'boolean') { val.payload.state[attr] ? nval = 'ON' : nval = 'OFF'; } else nval = val.payload.state[attr];// true/false > ON/OFF  
that.docmd(myf.topic,'state. :'+attr,'ser', 'python_script', 'set_state', el[1], nval);// el[1]='input_text.'+Ent_Prefix+'pgmrun'
}

});


} if((type==2||type==4)&&custF){// new injected func custF x type 2/4
if(custF.exec){// future use : run a server bash

}else{// send ha ent update or fire events
// cal x this dev new msg ( format like 777 dev ?)
//let param=state_.p;
let actions=custF(val,topic,state);// returns actions={ent:[[entname,newval,newattr={attrib1,,,,}]],events:[[eventN,attr,attrVal]],,,]}. state={customParam,,,,}
let pippolo='ciao';
if(actions)
if(actions.ent)actions.ent.forEach((entr)=>{// can also se attributes: entity.attribute=entr[2], see python in BBVV
let newattr=null;
if(entr[2])newattr=entr[2];// the attributes to set 
that.docmd(myf.topic,'set ent :'+entr[0],'ser', 'python_script', 'set_state', entr[0], entr[1],newattr);
});
else  if(actions.events)actions.events.forEach((entr)=>{
console.log(pippolo,actions);
that.docmd(myf.topic,'fire :'+entr[0],'event', entr[0],entr[1],entr[2]);
});

}


}else{// normal type 2,4  , topics=topic , update ent entity using msg.payload (msg in var dev has  std format )
if(ent){
let value=val.payload;// 0/1
let act;
if (value==1)act='1';else act='0';

that.docmd(myf.topic,' new value on topic ','ser','python_script','set_state',ent,act) ;// text,set_text
}
}
}

}else return null;// other type (0,3) dont write to ha !
}
function findCmdtopicEnt(entity){
if(cmdent!=null){
for(let i=0;i<cmdent.length;i++){
if(cmdent[i][0]==entity)return i;
}
return -1;
}return -1;
}
}

Fact.prototype.kepAlive=async function (reset=false){// if client==null: the promise will start a new ws connection client to ha, tracking state in main(), use reset to force. this=mqttInst
                                                    //  the connection start a heartbeat that will set a restart recalling kepAlive()
                                                   // resolve in  false if client is not (re)started

                                                   // >> better try restructuring the iteration of kepAlive when restart the connection in a cleaning way ?
    let connCfg=this.cfg.connCfg;// set in models.js new defFVMng() as localEntity.connCfg during plant registration/definition
                                  //localEntity: see in haPlants.json , the list of all ha plants configured
    if(reset)this.client=this.ws=null;
    if(this.client!=null)return true;// client is working if its not null !!  sure ? its enougth ?
    this.client=await getNewCon(connCfg,this.PRTLEV);// fills client ctl and its ws api ctl with a new connection . TODO really should just reset the client.ws conn
    this.ws=this.client.rawClient.ws;// raw ws protocol client
    
    if(this.client){
      let that=this;// this=mqttInst
      main(this.client); //  now trace current ha entities state on inState, events ,,,,

      // ws=client.rawClient.ws;
			this.client.on('ws_error',// in ws we used : client.on('error',
      console.error);
			//ws.onopen(heartbeat);// 
      this.ws.on('open',function (x){ // or ()=>heartbeat(this)
        heartbeat(that);}// TTGG
      
      );//client.on('open', heartbeat);
			this.ws.on('ping',function(x){
        heartbeat(that);}// that=Fact()=anewcon

      );//client.on('ping', heartbeat);
			this.client.on('ws-close',// or client.on('close',
                                //  ws.onclose handler will pass-trought the close event to client.emitter ws-close event.so here add a listener on ws_close. 
                                // but here this=client , so ws=this.ws ?

      function clear(){ // never called ?
                                          //   if server asks  to close clear connection obj then exit 
			  clearTimeout(this.ws.pingTimeout);
        if(PRTLEV>6) console.log('client fired ws-close event on ha connection ');
              that.client=that.ws=null;
             // to test : restartWs(that);
			});
      return true;
    }
    return false;
          /*
    from ws github, verify works in ws used by package hass

    			Just like the server example above your clients might as well lose connection without knowing it. You might want to add a ping listener on your clients to prevent that. A simple implementation would be:

			import WebSocket from 'ws';

			function heartbeat() {
			  clearTimeout(this.pingTimeout);

			  // Use `WebSocket#terminate()`, which immediately destroys the connection,
			  // instead of `WebSocket#close()`, which waits for the close timer.
			  // Delay should be equal to the interval at which your server
			  // sends out pings plus a conservative assumption of the latency.
			  this.pingTimeout = setTimeout(() => {
			    this.terminate();
			  }, 30000 + 1000);
			}

			const client = new WebSocket('wss://websocket-echo.com/');  // really here ws=client

			client.on('error', console.error);
			client.on('open', heartbeat);                               // so heartbeat has this =client ?
			client.on('ping', heartbeat);
			client.on('close', function clear() {
			  clearTimeout(this.pingTimeout);
			});

    */
	//		import WebSocket from 'ws';
			function heartbeat(inst) {// nb being a handler of ws.on('some',handler). probably as TTGG, this is the (client=ws).on context , 
                                // so this=global?? and inst=Fact instance=anewcon (see   TTHH) 
        if(PRTLEV>7) console.error('hawsclientFact  client ws received a ping heartbeat, so resetting a timeout to terminate this client ws conn after a not receiving next  ping');
			  clearTimeout(this.pingTimeout);// set previously in // TTHJ

			  // Use `WebSocket#terminate()`, which immediately destroys the connection,
			  // instead of `WebSocket#close()`, which waits for the close timer.
			  // Delay should be equal to the interval at which your server
			  // sends out pings plus a conservative assumption of the latency.
			  this.pingTimeout = setTimeout(() => {// TTHJ
          if(PRTLEV>5) console.error('hawsclientFact  ws didnt received a ping heartbeat, so terminate current ws conn and restart a new ws client conn ');
			    inst.ws.terminate();//this.terminate();
              
                restartWs(inst);
			  }, 60000 + 3000);

			
        /*
      // debugging : at first heartbeat start a timeout not resetted by oter heartbeat calls, so reset manually after 3 minutes 180000 ms:
      if(!this.pingTimeoutdeb )// just run once
      this.pingTimeoutdeb = setTimeout(() => {// TTHJ
        if(PRTLEV>5) console.error('+++++ debugging  hawsclientFact try to restart ws to ha ');
        clearTimeout(this.pingTimeout);
        inst.ws.terminate();//this.terminate();
            
              restartWs(inst);
      }, 120000);
      */

    }
  



      function restartWs(inst){// after a while restart the client on anew ws instance iterating this keepAlive() , inst=mqttInst
        inst.client=null;// todo restart only the ws instance ? seems too difficult
        inst.ws=null;
        inst.readyProm=// false;  error
                      null;inst.conReady=false;// so when dev state change we sen a topic msg but as conn is still to be restarted the change wont be sent into corresponding ha entitiy
                                          // todo : nullify all send to haws (using inst.client) see WWAA
                                          // todo nb as no data comes to ...  , inState could not receiving some update from ha !!!!!!!!!!!!!!!!!!!!!!
                                          //              nb inState is only x log of changing values , usually we insert income msg to process from a registered entity change , 
                                          //                          >> see Fact.prototype.setSwitch=function(ctlpack,topic, topicNodeRed,pubtopic)
        if(PRTLEV>7) console.error('++++ hawsclientFact try to restart ws to ha by 5 seconds ');
        
        setTimeout(() => {
          //inst.readyProm=
          inst.readyProm=// added 
          inst.kepAlive(true)// will reset the inst.client     BBGG
                 // inst.readyProm=inst.kepAlive(true);// restart connection , and main ?? 
                //  todo better wait the return of promise : inst.kepAlive().then((result)=>{if(result)inst.onReset();else console('kepAlive error:  cant get a valid connection to ha')});
                //    inst.client is != null if the conn to ha is estabilished
          .then((succ)=>{
            if(succ){// kepAlive ended ok , so docmd can process new updates to ha entities using  the new connection inst.client !
                inst.conReady=true;// another connection ws is got , goon with see WWAA , now docmd can update the ha entities (before the canges were lost )  see MMJJ

                if(PRTLEV>7) console.error('++++ hawsclientFact  restarted WS: ',inst.conReady);
                if(TEST)inst.test();// restart stdin test reads from terminal
            }
            // and main ?? 
           });// .catch()// wait more or restart or exit ...?

        if(inst.onReset)inst.onReset();// warn that the client was resetted 
			  }, 20000 + 3000);}
}

let docmd;// now used only to test . we test first plant that ask x a haws ctl

/* old 
function docmd(topic,reason,...reads){// old,now use PPHH . before instance. md,...arguments call ex: docmd(topic,reason,'ser','switch','turn_on','switch.rssi') docmd(topic,reason,'ser','python_script','set_state','switch.rssi','on')
 if(PRTLEV>5) console.log('docmd(), preparing ha ws callService: ha ws command fired on dev topic: ',topic,' reason: ',reason,
  '\n .... action[cmdtype=exit/ser/event,entitydomain=switch/python_script,cmdservice=turn_on/turn_off/set_state,entitynewval,entitynweAttrib]: ',reads);
  if (reads[0] == 'exit') console.error('Call a cmd, ends');
  else if (reads[0] == 'ser') {// ha ws api: command call , can be : call_service command or 
    // Call a service, by its domain and name. The third argument is optional.
    // console.log('docmd(), Call a service, by its domain and name. The third argument is optional:', reads);
    if(reads[2]=='turn_on'||reads[2]=='turn_off'||reads[2]=='set_state'){//  available service
      let target,data={// data=service_data={entity_id} , check : hs developers websocket API, calling a service
        // domain,name data={ entity_id: reads[3]
        //  ,state:'the new value'}// if domain='python_script'
        entity_id: reads[3]
        },service=reads[2];
      if(reads[2]=='set_state'){if(reads.length>4)data.state=reads[4];else return;// reads[1] must be 'python_script'. 
                                                                                  // can also set attributes , see https://community.home-assistant.io/t/how-to-manually-set-state-value-of-sensor/43975/3?page=6
                                // data={entity_id,state,attrib1,attrib2,,,}, so extract attrx from reads[5]
                                if(reads[5]){// read[5]={attrib1,attrib2,,,}
                                  for (item in reads[5])data[item]=reads[5][item];
                                }

                                }// service_data={entity_id,state}
       else {target=data;  // or target=reads[3]; ?  // if the request reads[2] is turn_on/turn_off
              // data=undefined;
                }
      // target={entity_id:'light.kitchen'=entity_id=reads[3]}; here or in service_data??? check api: seems in target
      //if(reads[3]=='switch.rssi')service='turn_on';// debug
      if(PRTLEV>7) console.log('docmd(), calling callService, domain:  ',reads[1],' service: ',service,' data: ',data,' target: ',target);
    client.callService(reads[1], service, data,target)//  callService(domain, service, additionalArgs = {},target) {// ex1: client.callService('switch','turn_on','switch.rssi' or {entity_id:'switch.rssi' ?}). question is client still connected ? , data=service_data
     .then((response)=>{
      if(PRTLEV>7)console.log('ha ws callService succeeded on action: ',reads);}
      ,(err) => { 
        console.error('ha ws callService not succeeded on action: ',reads,' with error: ',err); 
        console.log('ha ws callService not succeeded on action: ',reads,' with error: ',err); }
      ) // dont need the async cb 
      ;}
  } else if (reads[0] == 'event') {
    console.error('fire event, by type, data :', reads);
    let data = {}; data[reads[2]] = reads[3];
    client.fireEvent(reads[1], data)
          .then((response)=>{if(PRTLEV>8)console.log('ha ws fireEvent succeeded on action: ',reads);}) // dont need the async cb 
          ;
  }
}
*/

const controller={ /*
                      initx:// no|, arrow function take this from outer object , the obj n which you call the function !!
                        (swname,getread_)=>{this.getread=getread_;
                          this.setSwitch(swname);
                          return true;
                        },*/

  /* mngment summary :

                        an action fired to ha via ws with mqtt protocol is managed by ws ctl in haWs  , 
	set in mqttInst = new mqttClass(plantconfig) ,  set and returned in haWs init() , :
	
		   -if(plantconfig.isHaWebSoc) {// some dev have a corresponding ha entities ....  !!!
			    - connector=init_hawsclient(plantconfig);				<<<   returns  hawsclient.init(cb,PRTLEV,plantconfig),  an instance of wsclientFact() 
			    												it returns anewcon , a connector instance to ha ws library index....js:
			    													anewcon=new Fact(ctlcb_,plantconfig,PRTLEV_)			a obj
			    														then inject to anewcon the func to do a ws cmd :
			    															anewcon.docmd=function(topic,reason,...reads) : send data to ha using anewcon.client TTFF
			    														
			    														then running anewcon.readyProm=kepAlive(true):  a promise 
			    															resolving it, we set in anewcon.client  the ctl to connect to ha ws library :
			    																this.client=await getNewCon(connCfg,this.PRTLEV);	// TTFF (this=anewcon).client
			    																	nb: getNewCon resolves into clientInst= hass_(connCfg, PRTLEV);// a promise
			    																		hass_=createClientresolving=connectAndAuthorize(client,clientObject(client));
			    																			>>  resolves with clientObject(client) when the handler is called:
			    																				client.emitter.on('auth_ok',handler)
			    																				(event fired returning from a async ws call to ha)
			    															
			    															and also a ref to ws basic obj in client :
			    																this.ws=this.client.rawClient.ws;
			    																on which ws, we register a open and ping event  heartbeat handler  :
			    																	ws.on(open,function (x){ heartbeat(that);});	event from ws
			    																	this.ws.on('ping',function(x){heartbeat(that);} , event from this=anewcon (passed by ws)
			    																	
			    																	in heartbeat we start a timer that, if not reseted, :
			    																		terminate the current this=ws instance
			    																			this.terminate();
	    																				restart the connection on current inst=anewcon
                																				restartWs(inst), where :
                																				
                																				       reset current client and ws  inst.client=inst.ws=null;
                																				       and after a timeout :
        
																							  inst.kepAlive();// restart connection , and main ??
        																						  inst.onReset();// warn that the client was resetted 
                																				
                																			
			    - this.ws=new wsClass(connector);	// this=mqttInst  , mqttInst.ws is the client to use, instead of client, to connnect the dev connected to ha via ws with mqtt ptotocol
				nb ws.hawsclient=connector   nb hawsclient=connector=init_hawsclient(plantconfig)	<<<   hawsclient.init(cb,PRTLEV,plantconfig)  << anewcon=new Fact(ctlcb_,plantconfig,PRTLEV_), instance of wsclientFact() LOPPO 
				
															(ws.hawsclient=anewcon).client=await getNewCon(connCfg,this.PRTLEV);	// TTFF (this=anewcon).client
			    																	getNewCon resolves into clientInst= hass_(connCfg, PRTLEV);// a promise
			    																	so the    
			    
when in async function getio  we want to get ctlpack we call :
	mqttClass.prototype.fact = function(gp,ind,inorout='out',injCustDev)
		 return promise resolving in  ctlpack={ctl:new fc(gp,ind,inorout,cfg)={gpio=portid/devid,devNumb=index,type=inout,cfg,cl=1(clas='out')/2(a var)/3(clas='in'OR'prob'),ison,readsync,writesync},
		                                //                                               ex: ctl={cfg=	{portid,clas protocol,subtopic},cl:1,devNumb:0,gpio:11,isOn:true,readsync,writesync}
		                                //                                       				devNumb:ind,
		                                //                                          			type:'mqtt'}  
		                                
		in fact() :
		- we got the dev ctl with :
		 	fc= function (gp,ind,inorout,cfg,mqttInst)
		 
		 		where we set as wsclient  ws ,the ws connection ctl :
		 	
		 	   if(cfg.client=='haWebSoc') 		//  KKUU choose the client between mqtt and haws client( will use state in writeSync(val,state)) ...... !!!
  				  this.wsclient=mqttInst.ws;	// LOPPO recover the ws client , is connected ?


		- before resolving fact() into the ctlpack it is checked (hawsclient case only ) that the first connection is esthabilished : ctlpack.ctl.wsclient.hawsclient.client  HHOOII
			testing the promise   ctlpack.ctl.wsclient.hawsclient.readyProm so setting ctlpack.ctl.wsclient.hawsclient.conReady=true
				we are sure that is set :
					ctlpack.ctl.wsclient.hawsclient.client , filled with the resolved of getNewCon(connCfg,this.PRTLEV); // resolves imply conReady=true ,  AAIIUU    ??????


*/             
                    init:// returns newcon=new Fact().kepAlive() , a promise ?
                      function (ctlcb_, PRTLEV_=2, plantconfig//,ctlComTopic_
                      ) {
                        let anewcon;
                        if(PRTLEV_>PRTLEV)PRTLEV = PRTLEV_; // set if less 
                        //hass_.setctx(PRTLEV);
                        //  this.queues=getread_;// A) : bring queue here or 
                        // nomore :: ctlcb = ctlcb_;// this cb(atopic,val) will pub atopic with val on fv3 mqtt incoming handler
                        //  B) : let cb will fill queue  , ( equivale a dev topic )
                        // ctlComTopic=ctlComTopic_;// >>>>>>>>>>>>>>  can be avoid using LLCC, so got the name of topic and cmdtopic from ....  and put the topic on ctlcb(topic/cmdtopic,val)
                        //if(ctlpack);// ?? this.transYalm();
                        if(plantconfig.connCfg){
                          anewcon=new Fact(ctlcb_,plantconfig,PRTLEV_);// wil be  .mqttInst
                          anewcon.conReady=false;// see MMJJ
                          anewcon.readyProm=anewcon.kepAlive(true); //set this promise to check after   (when? in fact()? see MMJJ)   if the connection is ready , so set conReady=true ! see  HHOOII
                                                                    // problem how can conReady become true ?  AAIIUU  say yes ,is true ?
                          anewcon.docmd=(function(client_){// a func with a closure local var not available from outside (different from obj var !)   , see BBHH
                                                          // anyway this is a func added to obj, better use its alternative .docmd_ : a Fact prototipe func .docmd_ also if with var available as obj property
                                                          // todo : do the same in .setSwitch
                                                          // used in BBHH1
                                                          // need anewcon.client : yes to call callService or fireEvent !
                            // let client=client_;
                            return function (topic,reason,...reads){// PPHH cmd,spread syntax, ...arguments call ex: docmd(topic,reason,'ser','switch','turn_on','switch.rssi') docmd(topic,reason,'ser','python_script','set_state','switch.rssi','on')
                                                                    // surely bound to hawsclient anewcon=ws.hawsclient inst, so  this.client is a the library instance to connect to ha (): = await getNewCon(connCfg,this.PRTLEV);

                                                                    // this is the anewcon

                                if(!this.client||!this.conReady)return;// do nothing we dont have the connection this.client (by this.) and not ready , MMJJ
                                                                    // wait next data to send and recheck if client is reset by .kepAlive(true).then(..) in BBGG
                                                                    // accepted cmd :
                                                                    // reads= [ 'ser', 'switch'       , 'turn_onoff', 'entityname' ]   
                                                                    //        [ 'ser', 'python_script', 'set_state' , 'entityname','newvalue' ,'a attributename of entity','its text? value' ]
                                                                    // or
                                                                    // reads=[ 'event', 'mydomain_event', 'device_id', 'y-device-id' ,'type',"motion_detected"]  max 2 attributs

                              if(PRTLEV>5) console.log('docmd(), preparing ha ws callService: ha ws command called on topic: ',topic,' reason: ',reason,
                                '\n .... action[cmdtype=exit/ser/event,entitydomain=switch/python_script,cmdservice=turn_on/turn_off/set_state,entitynewval,entitynweAttrib]: ',reads);
                               if (reads[0] == 'exit') {console.error('Call a cmd, ends');
                               if(cb)cb();
                                }else if (reads[0] == 'ser') {// ha ws api: command call , can be : call_service command or 
                                 // Call a service, by its domain and name. The third argument is optional.
                                 // console.log('docmd(), Call a service, by its domain and name. The third argument is optional:', reads);
                                 if(reads[2]=='turn_on'||reads[2]=='turn_off'||reads[2]=='set_state'){//  available service , domain must be switch/.. or python_script, if set_state 
                                   let target,
                                   data={// data=service_data={entity_id} , check : hs developers websocket API, calling a service
                                     // domain,name data={ 
                                     //  ,state:'the new value'}// if service is set_state add state as newvalue

                                     //  ,an_entity_attribute to merge with entity attribute example data.weather='piovoso'  , we set entity attribute .weather=data.wheather
                                     //           >> so data properties different from state and entity_id will become properties of the entity 
                                     entity_id: reads[3]
                                     },service=reads[2];
                                   if(reads[2]=='set_state'){if(reads.length>4)data.state=reads[4];else return;// service is set_state, domain/reads[1] must be 'python_script'. 
                                                                                                               // can also set attributes , see https://community.home-assistant.io/t/how-to-manually-set-state-value-of-sensor/43975/3?page=6
                                                             // data={entity_id,state,attrib1,attrib2,,,}, so extract attrx from reads


                                                             
                                                             // if(reads.lenght>5){// read[5]={attrib1:val,attrib2:val,,,}// must be a map write entity attribute 
                                                             //  for (item in reads[5])data[item]=reads[5][item];// merge map into data 
                                                             // }

                                                            
                                                             if(reads.lengh>6){data[reads[5]] = reads[6];// a map with only one property with its value
                                                             if(reads.lengh>8)data[reads[7]] = reads[8];// a map with only one property with its value
                                                             }








                                                          }// service_data={entity_id,state}
                                      else { // target=data; // optional
                                        
                                        // target=data; or target=reads[3]; ?  // if the request reads[2] is turn_on/turn_off
                                              // data=undefined
                                            const notuseswitch=true;//: use set_state instead of turn_on turn_off
                                            if(notuseswitch){
                                              reads[1]='python_script';// force service 
                                              if(reads[2]=='turn_on')
                                                data.state='on';
                                                else  data.state='off';
                                              service='set_state';
                                            }
                                                }
                                   // target={entity_id:'light.kitchen'=entity_id=reads[3]}; here or in service_data??? check api: seems in target
                                  // if(reads[3]=='switch.rssi')service='turn_on';// debug
                                                let rand=0;
                                   if(PRTLEV>7) 
                                   rand=Math.floor((Math.random()*1000000)+1);
                                   //console.error('pippo');
                                   {let outs='docmd(), calling callService, id: '+rand+', actions: '+reads+'\n domain(switch/python_script):  '+reads[1]+' service(turn_onoff/set_state): '+service+' dataobj: '+JSON.stringify(data)+' targetentity: '+target;
                                   console.log(outs);
                                   console.error(outs);}

                                                                /* to send :
                                                                       {
                                                                        "id": 24,
                                                                        "type": "call_service",
                                                                        "domain": "light",
                                                                        "service": "turn_on",
                                                                        // Optional
                                                                        "service_data": {
                                                                            "color_name": "beige",
                                                                            "brightness": "101"
                                                                                                    >> some says i can set here the entity_id prop !!!!
                                                                        }
                                                                        // Optional
                                                                        "target": {
                                                                            "entity_id": "light.kitchen"
                                                                        }
                                                                        // Must be included for services that return response data
                                                                        "return_response": true
                                                                        }

                                                                         client.callService('light','turn_on',{entity_id: 'light.kitchen'
                                                                                                                // optional 
                                                                                                                    ,"color_name": "beige"
                                                                                                                    ,"brightness": "101"
                                                                        
                                                                                                            }
                                                                                                            ,{entity_id: 'light.kitchen'}   // seems duplicate !
                                                                                                                 
                                                                                                                 )

                                                                          so  reads= [ 'ser', 'light'       , 'turn_on', 'light.kitchen' ]  


                                                                      to send 
                                                                       {
                                                                        "id": 24,
                                                                        "type": "call_service",
                                                                        "domain": "python_script",
                                                                        "service": "set_state",
                                                                        // Optional
                                                                        "service_data": {
                                                                          "entity_id": "entityname ex switch.rssi"
                                                                            "color_name": "beige", // optional
                                                                              "state":'newvalue'
                                                                        }


                                                                        // Must be included for services that return response data
                                                                        "return_response": true
                                                                        }



                                                                         client.callService('python_script','set_state',{entity_id: 'entityname'
                                                                                                                state:'newvalue'
                                                                                                                // optional attribute
                                                                                                                    ,"color_name": "beige"
                                                                                                                    
                                                                        
                                                                                                            }
                                                                                                            
                                                                                                                 
                                                                                                                 )



                                                                          so  [ 'ser', 'python_script', 'set_state' , 'entityname','newvalue' ,'color_name','beige' ]


                                                                        */







                                 this.client.callService(reads[1], service, data,target)//  question is client still connected ? , data=service_data
                                  .then((response)=>{
                                   if(PRTLEV>7)console.log(' docmd(): dev topic: ',topic,' emission caused ha ws callService succeeded on execution of action: ',reads);
                                   if(this.test&&reason=='testing')
                                   this.test();// restart input x new test  GGQQ  ,  JJHHNN
                                  }
                                   ,(err) => { 
                                     console.error('ha ws callService not succeeded on id: '+rand+', action: ',reads,' with error: ',err); 
                                     console.log('ha ws callService not succeeded on id: '+rand+', action: ',reads,' with error: ',err); }
                                   ) // dont need the async cb 
                                   ;}
                               } else if (reads[0] == 'event') {// reads=['event','eventname','firstpropertyname','first property val']
                                 console.error('fire event, by type, data :', reads);
                                 let data = {}; 
                                 if(reads.lengh>3){data[reads[2]] = reads[3];// a map with only one property with its value
                                 if(reads.lengh>5){data[reads[4]] = reads[5];// a map with only one property with its value
                                 if(reads.lengh>7)data[reads[6]] = reads[7];// a map with only one property with its value
                                 }}
                                 this.client.fireEvent(reads[1], data)
                                       .then((response)=>{if(PRTLEV>8)console.log('docmd(): dev topic: ',topic,' emission caused ha ws fireEvent succeeded on execution of action: ',reads);

                                                        /* see https://developers.home-assistant.io/docs/api/websocket#fire-an-event
                                                            to send :
                                                            {
                                                                "id": 24,
                                                                "type": "fire_event",
                                                                "event_type": "mydomain_event",
                                                                // Optional
                                                                "event_data": {
                                                                    "device_id": "my-device-id",
                                                                    "type": "motion_detected"
                                                                }
                                                                }

                                                            : client.fireEvent('mydomain_event',{"device_id": "my-device-id",
                                                                                                "type": "motion_detected"
                                                                                                })
                                                            so reads=[ 'event', 'mydomain_event', 'device_id', 'y-device-id' ,'type',"motion_detected"]  

                                                            */




                                       if(this.test&&reason=='testing')this.test();// restart input x new test,   JJHHNN
                                    }) // dont need the async cb 
                                       ;
                               }   
                               console.error('poppo:');
                             }
                          })();
                          if(TEST)(anewcon.test=TEST(anewcon,plantconfig.plantName)) // try register testing on anewcon.docmd definition. 
                                                                                  (); //so now we are waiting for user testing input
                                                                                      // after send a user testing docmd , at successful feedback we restart a new read x testing, see JJHHNN
                        }else return false;
                        // check ...
                        return anewcon;
                      }
                    ,
                    transYalm:()=>{// transer or check config addend
                    },
                    addDev:// useful ?
                        (swname)=>{
                          this.setSwitch(swname);
                          return true;
                        }
                    ,
                    //queues,
                    /*
                    setProbe:(name,ent)=>{//add a listener for the state changed event to fill the switch queue , dev type=3 of name name
                                        // mapped to ha entity ent

                      // ha sensor >>> dev topic, ovvero dev queue
                      if(Actstates[ent]) return false;// already registered
                      Actstates[ent]=true;
                        // if want present value : 
                        //  inState=await client.getStates();// store updated  state values inState[name];// start tracking the state with t
                        //  ctlcb(name,inState[name]);
                      client.on('state_changed', (stateChangedEvent) => {// future changes 
                        if(stateChangedEvent.data.entity_id==ent){
                        console.log(' rssi state_changed event update:  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state);
                        ctlcb(name,stateChangedEvent.data.new_state.state);// B)
                        // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                        }
                      });*/
                      subscribe:function (topic,option,cb){// option={type=0/1/2/3/4,topictype=0/1/2(topic,pubtopic,nrtopic),cfg}
                        if(topictype==0){// a probe val to transmit as dev topic to fv3 incoming process
                                          // topic was built  from a dev cfg in numbSubscr(val, that, ctlpack, subscred),,,
                                          //                                              ctlpack = {ctl,devNumb,type} 
                                          //                                              cfg=ctl.cfg={ portid, varx, isprobe, clas, protocol, subtopic } = cfg in  models.js   mqttnumb,,,, 
                                          //              >>>>>   adding cfg.haEnt='rssi'
                        }
                      },


                      //setSwitch:function (name,cmdent,ent,ctlpack){// see  WSTMS 
                        setSwitch:function (ctlpack,topic, topicNodeRed,pubtopic){// old not used anymore : moved to Fact()
                                                                                  // *** use fv3 device topics(topic,pubtopic,cmd topic) that interfaces fv3 with real device to interface related ha entity and its triggers,changes
                                                                                  //      returns the ha topic/pubtopic trigger handler 
                                                          //                         type 1 :the ha entity control the real devices usually with same topics . 
                                                          //                                    so we must relay the fv3 topics to :
                                                          //                                      - transmit the fv3 pubtopic to real device  . this is achived changing ha switch state after received pubtopic from fv3 
                                                          //                                            infact when writesync: fv3 publish to (topic/) pubtopic ( so not call fv3 handler msgList(topic,val) that is subscribed only to topic and cmd topic ) and 
                                                          //                                                                    fire a ha setstate service to associated switch entity (via  writeWs func ha handler of pubtopic x this dev ) 
                                                          //                                      - dont need to transmit back the real ha topic coming from real device  to fv3 
                                                          //                                     and transmit the cmd topic from the dedicated button entity  to send external cmd to managed device  by interrupt handler 
                                                          //                                            thats calling ctlcb(topic,val) that will call the msg handler : msgList(topic,val) 
                                                          //                          type 2/4 :the ha entity monitor the fv3 published topic  
                                                          //                                     and transmit the cmd topic from the dedicated button entity  to send external cmd to var device managed by interrupt handler
                                                          //                          type 3  : ...........



                                                          //      obsolete:
                                                          //  * ha >> fv3 :
                                                          //    - (type 3,4?) : add a ws listener for the state-changed entity (button/switch) on associated ha entity to fill the corresponding dev queue  
                                                          //      or
                                                          //    
                                                          //    - (type 1,2):  from associated ha cmd topic button entity send a cmdtopic to fv3 message handler the will issue a interrupt to specific user interface ws handler 
                                                          //       that will set a manual(user/external request/cmd) algo object  

                                                          //          >>> nb fw3 type 1,2 dev dont receive dev topic from ha, because not interested
                                                          //              , so device income goonP() cant fill dev queue 
                                                          //          but the proposal to  fv3 to change dev state (event from user int like ws)  must be done as cmd topic and managed throught interrupt calling associated browser ws handler

                                                          //  * fv3 >> ha 
                                                          //  - will return the writeWs func to call from writeSync to trigger ha associated switch change process (usually call a setstate service)
                                                          //    the name dev will be mapped to ha entity ent provided by customer in models numbSubscr,,, or something else

                                                          //  nb from fv3 , ex from models.js we get the associated ha entity and its cmd topic entity
                          /* remember ctlpack= {ctl:new fc(gp,ind,inorout,cfg,that),devNumb:ind,type:'mqtt'}

                          */

                         // let entStates=null;// hass......    todo point to state traced by hass , ex entStates['switch.rssi']='on'
                         let ctl=ctlpack.ctl,//
                         plantconfig=ctlpack.plantconfig,// the plant cfg
                         url;
                         let {topicMsg,cmdtopicMsg,cfg}=ctl;// cfg is the dev config
                        let portid=ctl.gpio,// dev portid
                        devind=ctlpack.devNumb,// dev index;
                        type = ctl.cl;// 0,1,2,3,4 , used to .....
                          portid==0?url='':url='setMan';// cmdtopic url setMan excluding portid 0 
                        
                        // let {eventMng='mqtt',haEntity,haManButton,package,dashboard}=cfg;// cfg =plant.mqttnumb/mqttprob[dev], the dev cfg

                        // ??
                        let {eventMng='mqtt',
                            haEntity,haManButton,// used to fire cmdtopic to fv3 , use a std cmdtopic msg format (PPLL) 
                            // state, // used in state dev: portid==777, to update ha entities using a proper msg format on topic msg
                            custF // new custF staff injected
                            }=cfg;// todo : ** are recovered on cfg=ctlpack.ctl.cfg=plant.cfg.mqttnumb/mqttprob[dev], the dev cfg, 
                                                                        // ctlpack.ctl.cfg.haEntity is the ha entity related to device with portid :  portid=ctlpack.ctl.gpio,
                                                                        // nb  only device that are relayed on user ha can have haEntity,and (no probe ) haManButton
                                                                        // haEntity is the target of topic or pubtopic 
                                                                        // haManButton event are source of cmdtopic msg to fv3
                                                                        // state only for portid=777
                          let state_=cfg.state;// better rename cfg attr state > state_ . state directives
                          /*
                          when add a plant for a user we add a basic info in models.plants ,
                           the user can register giving info:
                           - its hw connected relay to connect ex consenso e probes
                            - token per connettersi al ha del user via ws con questo modulo
                           a questo punto posso generare i file yalm in package e in dashboards via std obj (rispecchiano i file ora usati )che updato in funzione di  info
                            usandi il handler di app.post("/registerPlant/"  solo che riepio i package e dashboard invece che fare chiamata webhook 
                            ora qui posso trasferirli usando il sevice di trasferimento file che temporaneamente e' in configuration.yaml che il user deve aggiungere al suo configuration 
                            o in alternativa si copiera il pachage e il dashboard scaricabili durante la registrazione
                            see transYalm()

                            question: il supervisor ha per caso la capacità di leggere scrivere i file ??


                          */

                          // 

                          let cmdent=haManButton,// >> the buttons entities to send the device a std format cmd topic  (not type 3) with a url (to address a handler specific entry points) :    PPLL
                                                          //  - if type=1,2,4  entity that fire cmdtopic in a msg with url  'setMan' : haManButton=[[entity,on/off]
                                                          //  - if type=0 the entity that fire cmdtopic in a msg  with url  'mqttxwebsock' and its event :
                                                          //                    : haManButton=[[entitytostartprogram,event='repeatcheckxPgm'],
                                                          //                                    [entitytostoprogram,event='stopcheckxPgm'],
                                                          //                                    [entitytostart.....,event='repeatcheckxSun",
                                                          //                                    ....
                                                          //                                  ],

                                                          //  >>>>>>>>>>  knowing the event in cmdtopicMsg we can complete the msg data with the data required by the receiving dev handler on the specific url : 
                                                          //          see:     cmdtopicMsg: async function (url, event = null, param = null, val_ = 0, entStates, trackEnt, user = 'extctlId')



                                                          /* >>>>>  ex ( see : function defFVMng(user,plant,localEntity) in models.js ): 
                                                          cfg.haManButton=[['input_button.setManx3hours_portid11','on'],// todo : ha entity firing event on url related to cmdtopic :setMan
                                                                          ],

                                                          cfg.haManButton=[['input_button.start_savingservice','repeatcheckxSun'],// entity firing event on url related to cmdtopic of this dev 
                                                                          ['input_button.stop_savingservice','stopcheckxSun'],
                                                                          ['input_button.start_progservice','repeatcheckxPgm'],
                                                                          ['input_button.stop_progservice','stopcheckxPgm']]


                          >>>>> attenzione qui si usano i button per sparare i cmdtopic, def in function defFVMng(user,plant,localEntity) in models.js 
                                tuttavia in interface si sono aggiunti anche dei automation che al trigger degli entity sparano un event
                                 nel caso di problemi si potra usare tali event per sparare i cdmtopic al posto dei button entity . 
                                                                        

                                                          */

                          ent=haEntity; //  ha entity   >>    fv3 dev : 
                                        // type 3 dev (probe) :  the ha entity that send topic (not pubtopic or ) msg to dev income process (goonP) ,    PPLL 

                                        // fv3 dev  >>   ha entity  : 
                                        // type 1 dev : the ha entity to update on a pubtopic dev msg 
                                        // type 2,4 dev, not portid=777 : the ha entity to update on a topic dev msg
                                        // type 4 , portid=777 , a state dev , use state property , not this one !

                                        //  ex: 'switch.rssi' , the switch entity to represent the dev state  PPLL 
                                        /*

                                                haEntity:localEntity.switch_consenso},// this dev has a ha entity related whose name is inserted on plant.localEntity
                                        */
                           if(PRTLEV>5)console.log('hawsclient setswitch registering listener ha statechange to catch cmdentity for dev portid:',portid);
                          // now 
                          // - foreach dev type we must simulate the mqtt message handler call client.on('message',msgList=function (topic, message, packet) 
                          //    that, using mqtt, would be pub on a topic from ha after a change on corresponding dev entity in ha (  entity( switch/sensor) ,cmd topic button x fire interrupt) on dev topic or cmdtopic
                          //    compreso il dev type 0 that is a dev that receives cmd topic whose interrupt call a subset of browser ws emit events
                          //    >> in pratica ha deve mandare via wsclient nel message handler msgList  gli stessi msg sui topic che i dev si aspettano usando il normale  mqtt client !
                          //        in sostanza i topics sono :
                          //              per il type 3 probe il  topic topic
                          //              per type 1  il pubcopy e il cmd topic (il topic non interessa)
                          //              per  il type 2 il topic e il cmd topic
                          //              per il type 0 il topic
                          // - return the handler to call when the dev writesync pub data on pubtopic(/topic): wsclient.publish()
                          //        must update same ent like in mqtt case the ha mqtt trigger set from a message on pubtopic/topic 
                          //       HHSS : will trigger update of entity ent when dev writesync call wsclient.publish(dev_pubtopic, data)
                          //            nb in state dev , portid=777 we fill many entities from state values, all must be mapped to the entity in the package cfg that must be cloned/downloaded/webhooked fron fv3 server
                          //            temporaneamente lavoriamo su fixed package , so name are fixed and do need to be mapped in cfg data (models.js)
                          //     >> il pratica i dev writesync sono pub su :
                          //                pubtopic (type 1) e vanno a controllare il device fisico in attesa di msg su pubtopic o 
                          //                vengono  cortocircuitati nel topic (type 2 e 4) , :
                          //                    - quindi alimentando il queue del dev via handler msgList su topic e/o 
                          //                    - osservato da chi e' eventualmente subscribed su tale topic (che e' solo ha nel caso di wsclient)
                          //                se uso wsclient devo quindi assicurare che i messaggi publicati da writesync assieme al loro topic  alimenti un handler (HHSS) 
                          //                    che sia in grado di updatare le entity associate al device
                          //                     es : triggerare azioni service o event firing
                          //                     nb l'hanler dovra nel caso di type 1 dovra gestire lo update del entity associata che essendo entity reale avra un nome customizzato che 
                          //                      potra essere inserito in models.js nella conf del dev
                          //                      ma potra come nel caso del dev state (type 4 , portid 777) updatare le var state che sono associate a altrettante entity che non dipendono dal plant
                          //                        costanti perche definite nella config del package associato
                          //                      a fv3 comprese le dashbord def.

                          if(type!=-1){// useless, any type, but some ent , cmd ent can be null 
                                        // usually not all dev type has  a ha cmdent (button ) to send cmd topic , ex type 3
                                        //  type 1 and 2 and 4 and 0  are usually not interested to track the topic state of real entity ent on ha
                                        //  
                        //

                        /*
                        let hasent=false,hascmdent=false;
                        if(cmdent!=null) {if(Actstates[cmdent]==true) hascmdent=true;// already registered to trace cmdent state_changed event
                            else Actstates[cmdent]=true;} // aggiungo l'entity [] to trace all entities that can send this dev cmdtopic that are:
                                                          //  - if type=1 the entity that fire cmdtopic with url  'setMan' 
                                                          //  - if type=0 the entity that fire cmdtopic with url  'mqttxwebsock' and its event 
                                                          // es x consenso sara ent=switch.rssi e cmdent=input_button.setmanual_rssi_on_but
                            if(ent!=null) {if(Actstates[ent]==true) hasent=true;// already registered
                        else  Actstates[ent]=true;}
                        if(hascmdent&&hasent)return false;//  alredy processed 

                          // if want present value : 
                          //  inState=await client.getStates();// store updated  state values inState[name];// start tracking the state with t
                          //  ctlcb(name,inState[name]);

                          //   **  a) ha firing topics : depending on dev (use index or portid) fire  publish on topic (type 3 (probe), only ? ) or cmd topic ( type 1,2,4) 

                         // nb this client is the haws client homeassistant-ws, not the custom ws client wsclient in haWs!

                         if(!hascmdent)// ?
                          */
                         //let probee;// is a probe

                         if(cmdent)cmdent.forEach((it) =>{let ent=it[0];Actstates.push(ent);});// register entities in cmdent as tracked 

                         // *****  haManButton  cmdtopic management: register a change listener that according with haManButton entity event will send a msg (cmdtopic format: url,event,value,....)  on dev cmdtopic 
                        if(cmdent||(ent&&type==3)){
                          if(PRTLEV>6)console.log('hawsclient setswitch() called to set listener for cmdtopic/topic from ha entities:',ent,'-',cmdent,'-',state_);
                        client.on('state_changed', (stateChangedEvent) => {// add a listener x future changes . here checks the dev related entity (haEntity,haManButton) that fire topic and cmdtopic x this dev 
                                                                            // we could have just 1 listener that check all entity for all devs 
                          let msgtopics;// the msg x cmdtopic issued by this dev of type 2 : 

                          let finded,
                          entity_=stateChangedEvent.data.entity_id;// the entity that chnged state : usually a button press event
                          if(PRTLEV>7)console.log('hawsclient setswitch . listener for cmdtopic for entity: ',ent,' from entities ',cmdent,',\n   got statechange :',JSON.stringify(stateChangedEvent));
                          if(cmdent&&(finded=findCmdtopicEnt(entity_))>=0){//  the entity that fired its change is registered as this dev cmdtopic entity to send msg in cmdent array !

                                                                    // PPLL when ha entity  change a dev (! type 3 ) val will send a cmdtopic with a msg on std format
                                                                    //    depending on type we set automatically the url so that in income goonP() the correct interrupt handler will be chosen 
                                                                    //          type 0 : url= 'mqttxwebsock'
                                                                    //          type 1,2,4 url='setMan'
                                                                    // >>>>>>>>>>>>>    entity var or id ???????????   changes on cmdent entity 
                                                                                        // check is entity_id like switch.rssi   ???????
                                    // this will use the  client = await hass() set up of a emitter interface subscription: client.on ( works after launched command  command({ type: 'subscribe_events' },  )
                                    // but can also define a some additional triggers (see https://developers.home-assistant.io/docs/api/websocket/) like : 
                                   //  setTrigger: async () => command({ type: 'subscribe_trigger' }, client),
                                    /*
                                    {
                                                  "id": 2,
                                                  "type": "subscribe_trigger",        // command FRTT
                                                  "trigger": {
                                                      "platform": "state",
                                                      "entity_id": "binary_sensor.motion_occupancy",
                                                      "from": "off",
                                                      "to":"on"
                                                  }
                                              }


                                          and , using a button will be :
                                               .... {
                                                  "platform": "state",
                                                  "entity_id": "input_button.start_ensavings"
                                                } ....


                                    */ 
                                   // and manages the .onTrigger() (like we did with .on()  !!) checking the return of the command FRTT with its  id=2

                          let entity=entity_,// ok ?
                          event=cmdent[finded][1];// there is a entity entity that can send a topic to the dev interrupt handler to proces the event event

                          // ctlcb(name,stateChangedEvent.data.new_state.state);// B)

                          
                                              //             "topic": "@Casina_API@ctl_var_gas-pdc_4/NReadUser/cmd",
                                              //     msg >>       "{\"payload\":1,\"sender\":{\"plant\":\"Casina_API\",\"user\":1055},\"url\":\"setMan\",\"checked\":1,\"data\":{{ states.input_number.hour.state}}}\n"
                          

                          // ** here we have a to issue a dev cmdtopic msg. to fv3 income . it depende on dev type (?) and protocol because must be handle according to fv3 income handler 
                          //    so the msg x topic of a device is got by ctl.topicMsg=msgFormat.topicMsg;  and ctl.cmdtopicMsg
                          //  il dev avendo dichiarato haManButton sul dev mqttnumb significa che il entity haManButton è usato per emettere un cmdtopic msg che ha un format base che contiene
                          //  url che viene usato in goonP per cercare un handler registrato in una property ctl.int1 . l'handler lavora con msg con format base o uno esteso.
                          //  il msg viene creato da ctl.cmdtopicMsg che per costruire il msg (format base o esteso) ha a disposizione il context ctl che builda il msg per i 
                          //  url implementati (inserire handler, suo mappaggio in goonP, build del msg in cmdtopicMsg in msgFormat poi assegnato come property di ctl)

                        let url;
                        // >>>>  if a cmdtopic of a deve can fire more urls , add url to array in haManButton ex : 
                        //        cfg.haManButton=[['input_button.setManx3hours_portid11','on',url='setMan']],// 
                        type?url='setMan':url='mqttxwebsock';// set std url for dev type. url='mqttxwebsock' if type=0
                      
                        //+/  Actstates cant contain all entity addressed on cmdtopicMsg  !! (url,event=null,param=null,val_=0,Actstates,trackEnt,user='extctlId'
                        inState[ent]=stateChangedEvent.data.new_state.state;// updates value, tracking the entity
                        if(PRTLEV>7)console.log(' hawsclient setswitch .state_changed  (button) reports an entity',entity,' update/pressed, so according to dev haManButton[], fire an cmdtopic event: ',event,' on url: ',url ,
                        ',\n new value: ',inState[ent]);

                      
                        
                         // msgtopics=ctl.cmdtopicMsg(url,event,param=null,1,Actstates,trackEnt,user='extctlId');
                         msgtopics=ctl.cmdtopicMsg(url,event,param=null,ent,inState,user='extctlId',Actstates,plantconfig.Ent_Prefix);// >>>>>> according to url, event 'repeatcheckxSun' is fired by ha entity ('input_button.'+Ent_Prefix+'start_savingservice') 
                                                                                                              // build the standard msg to send on dev cmdtopic    (>>>>>> see msgFormat.cmdtopicMsg())
                                                                                                              //  ( so will be routed to a url/event entry point on the cmdtopic interrupt handler of the dev )
                                                                                                              // nb event point to a procedure to calc the msg using plantconfig that has info about the ha entity name of the plant (knows the entity name prefix Ent_Prefix)
                                                                                                              // all is specified by dev cfg  haManButton:                   HHGG
                                                                                                              /*
                                                                                                                      this.mqttWebSock=        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock',
                                                                                                                          haManButton:[['input_button.'+Ent_Prefix+'start_savingservice','repeatcheckxSun'],// >>> entity start_savingservice firing event repeatcheckxSun, on url related to cmdtopic 
                                                                                                                          ['input_button.'+Ent_Prefix+'stop_savingservice','stopcheckxSun'],
                                                                                                                          ['input_button.'+Ent_Prefix+'start_progservice','repeatcheckxPgm'],
                                                                                                                          ['input_button.'+Ent_Prefix+'stop_progservice','stopcheckxPgm'] 
                                                                                                              */

                                                                                                              // the payload, ha id, the url of the interrupt handler

                          ctlcb(topicNodeRed,msgtopics);// press of cmdent button will pub  new val on dev topicnodered=cmdtopic , so incoming process handler goonP() will receive val on the dev cmdtopic 
                                  // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                                  // in mqtt int  we did : ......................

                         
                        } else if(ent && stateChangedEvent.data.entity_id==ent){//ha entity send  dev topic msg: called only x probs (type 3). if ha entity want change a dev (! type 3 ) val will send a cmdtopic !
                            if(PRTLEV>7) console.log('hawsclient setswitch . ha entity ',ent,',transmit msg value to topic, only x sensor ....todo)  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state,
                            ' so process in fv3 goonP listener');
                            // ctlcb(name,stateChangedEvent.data.new_state.state);// B)

                            // ** here we have a to issue a dev topic msg. to fv3 income . it depende on dev type (?) and protocol because must be handle according to fv3 income handler 
                           // msgtopics= "{\"payload\":1,\"sender\":{\"plant\":\"Casina_API\",\"user\":1055},\"url\":\"setMan\",\"checked\":1}";  // nb data is useless !
 
                            msgtopics=ctl.topicMsg(stateChangedEvent.data.new_state.state);// build/format the msg for the topics topic , msg is simply stateChangedEvent.data.new_state.state (a number )

                            ctlcb(topic,msgtopics);// // changes of ent will pub new val on dev topic , so incoming process handler will receive val on the dev topic 
                            // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                            }
                            else  if(PRTLEV>7)console.log('hawsclient setswitch . listener for cmdtopic/topic for entity: ',ent,' found no matches');
                          })};





                            //   NOW :            fv3  >>>>>>>>>>>>>>>    sending device info to ha entities SSDDCB

                            // >>>>  ** now RETURN a function that will be used to update the ha entity related with the dev indipendentemente  of the topic/pubtopic but depending from dev type (not type 3)
      
                            // fv3 dev are write(d using writesync that pub a val on dev pubtopic to change the state of dev that gives values publishing on  dev topic:
                            //      .pub('pubtopic',val)
                            //          nb some dev type, like 2 ( not in  4 ? ) , pubtopic=topic so simulate a real switch device that pub on topic (so fill dev queue (the dev state)) just the val it was comanded using pubtopic
                            // in haWs we are using haws instead of mqtt, so we build a custom ws client (wsclient) that when .pub on a pubtopic/topic must change the associated ha switch like when it was done using mqtt:
                            //  >> so in wsclient when we .pub a topic we must do the same of the mqtt handler called becaused subscribed  on the dev pubtopic :
                            //      change the dev associated switch state !
                            //  so  on caller set :swclient.pubs[pubtopic]= the handler HHSS
                            //    that handler will be called when writesync calls wsclient.pub('thedev_pubtopic',val)

                          //   fv3  >>>> ha entities, sending device info to ha entities
                          // ** b) ha receiving  topics (topics=topic or pubtopic if type 1) from dev.writeSync(): depending on dev do action ( no : depending on topic or pubtopic ),
                          //       usually ha will fire event or switch service to change the entity state
                          if(type==1){// a relay/pump dev , a topics=pubtopic msg

                            // todo implement  on dev type or index .....
                          
                            if(PRTLEV>6)console.log('hawsclient setswitch ,  setting the writeSync pubtopic handler to send  dev portid: ',portid,' msg on pubtopic to ha entity: ',ent,' (type 1) using ws docmd to send a change state service ');
                          return function myf(val,topic,state) {  // val is 0/1 (on/off) , topics= pubtopic
                                                //              state is the eM.state just to get full state here
                                                // this is the handler for coming msg (from fv3) of ha subscribed dev topics ( YYKK ), ( topics is topic if type 2,4 anf pubtopic if type1)
                                                // as std mqtt case we can just updata the state of a mqtt switch or trigger a service from the coming mqtt msg topic 
                            
                            
                                                // HHSS : will trigger update of entity ent when writesync pubs on  dev pubtopic for type 1 and on topic for type 2 and 4:
                                                // in type 1 usually the ha entity ent is reading state from real device topic and pub on pubtopic to real device when we manually switch the device
                                                // so this func will be called when client.publish('topic',val) call with topic= the registered pubtopic on this device , see XXFF  
                            //    here we come for msg of topics (pubtopic x type1 , topic x type 2 e 4 : check it ! )
                            //    now the problem is the msg will be on/off unless the portid 777 dev that is the state dev 
                         
                            let act;
                            if (val=='on')act=ON;else act=OFF;
                            docmd(myf.topic,'new value on pubtopic','ser','switch',act,ent);// can be defaulted to call setstate python
                          };// call f('switch','turn_on','switch.rssi'

                        }else if(type==2||4){/* topics=topic
                          val =msg={"payload":0/1,"sender":{"plant":"Casina_API","user":55}
                          so like in mqtt entity :  "value_template": "{% if value_json.payload == 0 %} \"0\" {% elif value_json.payload == 1 %} \"1\" {% endif %}",
                        */
                        let det;
                        if(type==4&&portid==777)  det='for state entities: '+state_;else det='for ha entity: '+ent;
                          if(PRTLEV>6)console.log('hawsclient setswitch ,  setting the pubtopic handler to send  dev portit: ',portid,'writeSync msg (type 2/4) using ws docmd to send a change entity state service ',det);
                          
                          return function myf (val_,topic,state) {  // x dev 777 , val is set in ioreadwritestatus: 
                                                                    // myf.topic is set on .........   , unusual set a property in a func obj !
                              const val=JSON.parse(val_);
                            
                            if(type==4&&portid==777){// QQIIJK  portid=777  state dev: fill all std entity that depend on state var found on dev topic msg
                                                      // in this case the format of msg is an extendex format from the std format
                            // debug: topic should be @Casina_API@ctl_var_state_0
                            // use probmqtt state property to update entities when this dev will send a topic msg 

                              /* todo : a presence detector of 777 status connection
                                  just add a timer that will set a flag servicenotactive that detect when program algo is working
                                  when a 777 state arrives the timer is resetted 
                                  when the flag becomes active we know that the service is unavailable so we should :
                                  - do nothing : so the entities remain in the state of last 777 message
                                  - activate a local temp ctl : in program algo non active interval off all rele, in active interval start a spare termostat
                                      the spare termostat will check a condition on flag before trigger the action ! 
                              */






                            /*
                            val.payload= state:{anticipate,// send to ha the status it expects      JJOOPP
                                                program,
                                                battery:new_scripts.aiax.battery,
                                                inverter:new_scripts.aiax.inverter,
                                                desTemp,// desidered temp , giorno only !
                                                relays:new_scripts.relays// the pump browser state
                                    }})
                              
  
                            /* mosquitto_sub -t @Casina_API@ctl_var_state_0   -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                            {"payload":{"state":{ "anticipate":true,"program":true,"battery":1,"inverter":0,"desTemp":20,
                                                  "relays":{"heat":false,"pdc":false,"g":false,"n":false,"s":false,"split":false,"gaspdcPref":false,"acs":true}
                                                }
                                        },
                              "sender":{"plant":"Casina_API","user":777}
                            }
                            // so no need to customize acs,battery,inverter,desTemp :

                            */
                           // battery entity :

                              state_.forEach(el =>// for each  cfg.state  item  el  update the entity listed on  cfg.state , see GGUUNN, 
                                            //            el=[ keycode,entityname]=
                                            //            ['state.  program','input_text.'+Ent_Prefix+'pgmrun'],// * convertite true > 'ON'
                                            //            ['sender.user','input_text.'+Ent_Prefix+'opt_service1'],
                                            //            [state.relays.  acs,'input_text.'+Ent_Prefix+'acs'],  // * forse già usato solo come entity di acs pump: so useless 
                                 {
                                  let nval;// nb : convert boolean to string , let string , let number 
                                if (el[0] == 'sender.user') {
                                  // used to set the entity el[1] on or off depending on msg.sender.user value (777 means not a classical user but the procedure that send the msg (like a url in a post))
                                  // actually the el[1] dont exists .
                                  /* remember in models.js what about the property y=state[i] in dev cfg:

                                            // >>>>>>>>>  il func returned by setSwitch fillera le entity !  .    this non depend on cust def entity so just put here in the constructor
                                            // - remember the msg built in QQIIJJ of ioreadwritestatus.js is :
                                            //                                val=msg={ "payload":{"state":{"anticipate":true,"program":true,"battery":1.6,"inverter":0.5,"desTemp":20,
                                            //                                                              "relays":{"heat":false,"pdc":false,"g":false,"n":false,"s":false,"split":false,"gaspdcPref":false,"acs":true}
                                            //                                                                        }
                                            //                                                    },
                                            //                                          "sender":{"plant":"Casina_API","user":777}}

                                            // this var dev will send a msg (see in QQIIJK of hawsclient.js) to set different ha entities ( different from haEntity is the ent to write the new dev values extracted from the std format for a var msg (payload))
                                            //    - if y.[0]=state.x : the msg.payload.state.x value is used to set the entity y.[1]
                                            //    - if y.[0]=sender.user   >  write to entity y.[1] ON/OFF depending on msg.sender.user value 
                                                                    
                                  */
                                  // if(val.sender.user==777)......
                                
                                }else if (el[0].substring(0,13) == 'state.relays.') { // [state.relays.acs,'input_text.acs'],  
                                                                                        //is the pump index in mqttnumb
                                  // convert relays tru/false to ON/OFF
                                  let attr=el[0].substring(13) // attr='acs', val.payload.state= : see GGUUNN
                                  //if(typeof state.relays[el[0]]=='boolean')
                                  { val.payload.state.relays[attr] ? nval = 'ON' : nval = 'OFF'; }
                                  docmd(myf.topic,'state.relays. :'+attr,'ser', 'python_script', 'set_state', el[1], nval);// el[1]='input_text.'+Ent_Prefix+'acs'
                                }// entity like input_text !
                                else if (el[0].substring(0,6) == 'state.') {
                                  let attr=el[0].substring(6) // attr='program'/'desTemp' , see GGUUNN
                                  if (typeof val.payload.state[attr] == 'boolean') { val.payload.state[attr] ? nval = 'ON' : nval = 'OFF'; } else nval = val.payload.state[attr];// true/false > ON/OFF  
                                  docmd(myf.topic,'state. :'+attr,'ser', 'python_script', 'set_state', el[1], nval);// el[1]='input_text.'+Ent_Prefix+'pgmrun'
                                }

                              });
                           
                            
                            } if((type==2||type==4)&&custF){// new injected func custF x type 2/4
                              if(custF.exec){// future use : run a server bash

                              }else{// send ha ent update or fire events
                                  // cal x this dev new msg ( format like 777 dev ?)
                                //let param=state_.p;
                                let actions=custF(val,topic,state);// returns actions={ent:[[entname,newval,newattr={attrib1,,,,}]],events:[[eventN,attr,attrVal]],,,]}. state={customParam,,,,}
                                let pippolo='ciao';
                                if(actions)
                                if(actions.ent)actions.ent.forEach((entr)=>{// can also se attributes: entity.attribute=entr[2], see python in BBVV
                                  let newattr=null;
                                  if(entr[2])newattr=entr[2];// the attributes to set 
                                  docmd(myf.topic,'set ent :'+entr[0],'ser', 'python_script', 'set_state', entr[0], entr[1],newattr);
                                });
                                else  if(actions.events)actions.events.forEach((entr)=>{
                                  console.log(pippolo,actions);
                                  docmd(myf.topic,'fire :'+entr[0],'event', entr[0],entr[1],entr[2]);
                                });

                              }
                            
                            
                            
                            
                            }else{// normal type 2,4  , topics=topic , update ent entity using msg.payload (msg in var dev has  std format )
                            if(ent){
                        let value=val.payload;// 0/1
                        let act;
                            if (value==1)act='1';else act='0';
                            
                            docmd(myf.topic,' new value on topic ','ser','python_script','set_state',ent,act) ;// text,set_text
                            }
                            }
                          }

                      }else return null;// other type (0,3) dont write to ha !
                          }
                      function findCmdtopicEnt(entity){
                            if(cmdent!=null){
                            for(let i=0;i<cmdent.length;i++){
                              if(cmdent[i][0]==entity)return i;
                            }
                            return -1;
                            }return -1;
                          }
                    },
                    /*
                    setCmdInterf:function (name,startcmdentity,stopcmdentity,ent){// see  WSTMS . ent : the entity associated to start stop algo ,ex: startcmdentity and stopcmdentity, the button entities to start stop the service 
                                                                                  // these entity usually are button , when pressed must send a msg on cmd topic x the interfae device (portid=0)
                                                                                  // see WQSD

                      //  * start/stop algo cmd ha >> fv3 event handler called using a interface device ( the cmd topic will call a browser ws event handler 
                      //        ex: event,handler :  socket.on('startprogrammer',repeatHandler1) . repeatHandler1 is called by interrupt intWebSock, when in goonP we process :
                      //                else {// isCmdTopic  ......       
                      //    - add a ws listener for the state-changed entity (button) on associated ha state cmd entity (ex: button start_progservice ) 
                      //        in mqtt si triggerava il change staus con un automation , id= strpgmserv, verso il cmdtopic interrupt  verso il interface (type 0 (~type 2)) int dev  :
                      //           @Casina_API@interface_mqtt_websock_0/NReadUser/cmd 
                      //        in ha ws we use the ctlcb to fire the  associated int dev  interrupt that is used to fire cmd algo handler (the same fired on receiving same emitted cmd from browser)
                      //            nb si potrebbe anche sparare un automation triggerando dal change button    o registrare banalmente un trigger sul change button state  in ws client 

                      //  * fv3 >> ha cmd status entity  BBFG
                      //  * fv3 state fills a type 4 state device (used just as a channel, a state probe input properties) >> ha fv3 algo status switch  and fv3 state vars x info (ex battery,,,, usually implemented  as probes in ha )   
                      //  - il cmd browser ws event 'state' lanciato/emitted , se attivo, verso il browser  ws e aggiornando con writeSync verso lo state dev : mqttprob[virtualindex[0]] ,  topic=@Casina_API@ctl_var_state_0:
                      //        stind=state.app.plantconfig.virt2realProbMap[0] ,  is the mqttprob dev type 4 ( mqttprob[virtualindex[0]]) reserved to pub (essendo type 4 si publica su pubtopic=topic ?) state var  using writesync   
                      //              mqttprob:[,,,{portid:777,subtopic:'var_state_',varx:0,isprobe:false,clas:'var',protocol:'mqttstate'}}// state var , usually portid=777

     		   //??           //     ora, mentre in  mqtt si provvedeva a invialo sul topic del type 4 state dev, e , quindi raccolto dal associated ha state mqtt entity  optimizing_fv
     		   // ??           //    in  ha ws will use this returned function  writeWs  to send a turn_on/off service to associated state entity optimizing_fv


                      
                      //  nb fv3 , ex in models.js we get the type 4 state var and associated ha algo entity and its cmd topic entity

                      //   ..................... todo review following code :

                      let cmdent=startcmdentity,cmd;
                      if(Actstates[cmdent]) return false;// already registered
                      Actstates[cmdent]=true;
                      Actstates[stopcmdentity]=true;
                      // if want present value : 
                      //  inState=await client.getStates();// store updated  state values inState[name];// start tracking the state with t
                      //  ctlcb(name,inState[name]);
                      client.on('state_changed', (stateChangedEvent) => {// future changes , button press !!!
                      if(stateChangedEvent.data.entity_id==cmdent)cmd='ON';
                      else if(stateChangedEvent.data.entity_id==stopcmdentity)cmd='OFF';
                      if(cmd){
                      console.log(' algo button state_changed/buttonpress event update (button press or its automation firing an event)  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state);
                      // ctlcb(name,stateChangedEvent.data.new_state.state);// B)
                      // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                      ctlcb(name,cmd);
                      }});

                      // ?????? todo put here all switch/sensor that are triggered from state dev topic/pubtopic
                      return function (val) {
                      // if a number

                      let act;
                      if (val==1)act=ON;else act=OFF;
                      docmd('ser','switch',act,'switch.'+ent);
                      }// call f('switch','turn_on','switch.rssi'
                      
                      },
                      */
                    getCon:function(){// old
                      // start connection when init , here just returns the ws obj, not used presently    // kepAlive(true);
                        return { ws// gethasscon=haws.getCon();   ws=gethasscon.ws() ; if(ws)ws.....()
                                      /*
                                          ws can be used to implement the function that make readsyn and writesync working with the external entity defined by protocol
                                          for example :
                                          - type 1
                                             in mqtt when we work with mqtt we write algo proposal in pub topic , check in topic and change the algo proposal with a cmd topic and its interrupts
                                             in ws we have a remote entity switch to command and to listen to cmd topic events
                                             so in ctl.writesync created by  ctl=new fc(gp,ind,inorout,cfg) called in : 
 	 			    										                                              ctlpack = mqttInst.fact(num, ind, iotype, injCustDev_) 
                                                                              see TTRROO in doc 
                                             we will send a service turn_on/off switch and attend on readsync some of :
                                              - the promise resolution (needed?)
                                              - the ricorrent data from switch state using a ricorreent trigger that change a specific event we are listening for (needed ?)
                                                    
                                              - the state transition from the switch that we are subsribed , or better

                       >>>>                   - we register a remote trigger that will send us the state change of wsitch
                                                           > use client.on('state_changes',) rinforzato da 
                                                                client.subTrigger('time_pattern','wsitch.rssi')
                                                                to fill the dev queue
                                                           or simply register a event client.on('state_changed', ) and check for specific swith changes on the switch
                                                           >>>> so we dont need to change config data just use user login info about its switch to interconnect !
                                                  +
                                                -  a recover of switch state in case of reconnection > use let states=await client.getStates(); at conn restarting 



                                      */

                    }
                    }
                }
                module.exports =  controller;