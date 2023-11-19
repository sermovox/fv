// import hass from "homeassistant-ws";
//import * as hassImp from 'homeassistant-ws';
// const hass = hassImp.default;
const readline = require('readline').createInterface({// see https://stackoverflow.com/questions/65260118/how-to-use-async-await-to-get-input-from-user-but-wait-till-entire-condition-sta
    input: process.stdin,
    output: process.stdout,
  });

  const ON='turn-on',OFF='turn-off';

const hass=require("homeassistant-ws");// to install : npm -i homeassistant-ws .... see YYKK 

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
kepAlive();
// if(client)main();

async function getNewCon(){

      // Establishes a connection, and authenticates if necessary:
  client = await hass({  // ..... LLHH resolve with clientobj=clientObject(client)
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJiNmYxMDk3NDYxODI0YmZhYjkwNTc2NjQ1ZDVmODU4MyIsImlhdCI6MTY5NDQ0Mjg2MiwiZXhwIjoyMDA5ODAyODYyfQ.ppeuf-Ma1vLVQCT0Qrt07C5TXGHsHasX3ElOl1NCX3A', 
    host: '192.168.1.212',
    port: 8123,
   });
   ws=client.rawClient.ws;// clientobj.ws ,  in  "isomorphic-ws"  we got the connected ws obj  : clien.trawClient.ws=require("isomorphic-ws")(ws://localhost:port/path) 
                          //    seems == to require("ws")(ws://localhost:port/path) in nodejs

   // console.log('ciao mondo :\n',JSON.stringify(client));


}


async function main() {// call in a connected client to init the data transmission
    // client can get null when after  connection lost
    if(client==null)return;
      // Get a list of all available states, panels or services:
  inState=await client.getStates();// store initial state values
  console.log('inital states are: ',inState);

      console.log('ciao mondo :\n',states);


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
    console.log(' raw message received: ',rawMessageData);
  });

  // Listen only for state changes:
  client.on('state_changed', (stateChangedEvent) => {
    console.log('state_changed event : ',stateChangedEvent.data.new_state.state);
  });

let ex=false;


    let outprompt='>>>>>>>>>>>> please input :  lights,turn_on,light.my_light ';
    console.error('now start requesting iterately: ',outprompt);

    doinp();

  function doinp(){  requestInput(outprompt).then(readin);// debug, if we were in a async we could : await  requestInput()
  }

  function readin(read_) {
    let reads = read_.split(",");
    docmd(...reads);
  }
  function docmd(...reads){// cmd,...arguments call docmd('ser','switch','turn_on','switch.rssi')
    if (reads[0] == 'exit') console.error('Call a cmd, ends');
    else if (reads[0] == 'ser') {
      // Call a service, by its domain and name. The third argument is optional.
      console.error('Call a service, by its domain and name. The third argument is optional:', reads);
      client.callService(reads[1], reads[2], {
        entity_id: reads[3]
      }).then(doinp);
    } else if (reads[0] == 'event') {
      console.error('fire event, by type, data :', reads);
      let data = {}; data[reads[2]] = reads[3];
      client.fireEvent(reads[1], data).then(doinp);
    }


  }

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
}
function getState(){

}
let ws,// the current ws if active
wsArr,// the ws in fv3 ??
client,
Actstates={},// the upated ha state list  we want to trace, can be :
              //  - switch state (pubtopic,topic state is only to check what the switch is doing and can be avoid) or 
              //  - probe state : topic only
              //  - switch buttonpress (cmdtopic)event
inState=null,// the updated state of Actstates: if null means there is no connection active
            // it will be init with state at connection , then when we add a dev queue  add Actstate and 
            // add state-change handler that 
            //  - at next update updates Actstates and call ctlcb to fill the queue 
            //    we can use the present inState if  reset inState=await client.getStates(); then :
            // - we can call ctlcb, just after the add queue request, to send present value
ctlcb=null; // issue topic val on subscribed topic to the message handler
            //   the cb function to fill fv3 Actstates cmdtopic/interrupt ( queue not interesting) for type 1,2
            //                                      topic ovvero queue per type=3
            //    so x topic and cmdtopic
// ctlComTopic=null;// cmdtopic entry point 


function updateState(entity=null){// will call the ctl cb to fill fv3 queue
  if(ctlcb==null) return;
if(entity==null){
 for(ent in Actstates){
  ctlcb(ent,null);// fill ent queue with null: no connection 
  }}else {
    ctlcb(ent,inState[ent]);
  }
}


function kepAlive(reset=false){// start tracking a new connecting client, use reset x ....
    if(reset)client=ws=null;
    if(client!=null)return;
    getNewCon();// fills client and ws with a new connection 
    if(client)main();// restart tracing state, events ,,,,
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

			const client = new WebSocket('wss://websocket-echo.com/');

			client.on('error', console.error);
			client.on('open', heartbeat);
			client.on('ping', heartbeat);
			client.on('close', function clear() {
			  clearTimeout(this.pingTimeout);
			});

    */
	//		import WebSocket from 'ws';
			function heartbeat() {
			  clearTimeout(this.pingTimeout);

			  // Use `WebSocket#terminate()`, which immediately destroys the connection,
			  // instead of `WebSocket#close()`, which waits for the close timer.
			  // Delay should be equal to the interval at which your server
			  // sends out pings plus a conservative assumption of the latency.
			  this.pingTimeout = setTimeout(() => {
			    this.terminate();
                client=ws=null;
			  }, 60000 + 1000);
        setTimeout(() => {
			  kepAlive();// restart connection , and main ??
              
			  }, 60000 + 1000);
			}


      // ws=client.rawClient.ws;
			client.on('ws_error',// in ws we used : client.on('error',
      console.error);
			//ws.onopen(heartbeat);// 
      ws.on('open',//function(x){ heartbeat(x);}
      heartbeat
      );//client.on('open', heartbeat);
			ws.on('ping',// function(x){heartbeat(x);}
      heartbeat
      );//client.on('ping', heartbeat);
			client.on('ws-close',// client.on('close',// //  ws.onclose handler will pass-trought the close event to client.emitter ws-close event.so here add a listener on ws_close. 

      function clear(){ 
                                          //   if server asks  to close clear connection obj then exit 
			  clearTimeout(this.pingTimeout);
              client=ws=null;
			});
}

const controller={ /*
                      initx:// no|, arrow function take this from outer object , the obj n which you call the function !!
                        (swname,getread_)=>{this.getread=getread_;
                          this.setSwitch(swname);
                          return true;
                        },*/
                    
                    init:// 
                        function (ctlcb_,ctlComTopic_){
                         //  this.queues=getread_;// A) : bring queue here or 
                          ctlcb=ctlcb_;// B) : let cb will fill queue  , ( equivale a dev topic )
                          ctlComTopic=ctlComTopic_;// >>>>>>>>>>>>>>  can be avoid using LLCC, so got the name of topic and cmdtopic from ....  and put the topic on ctlcb(topic/cmdtopic,val)
                          return true;
                        }
                    ,
                    addDev:// useful ?
                        (swname)=>{
                          this.setSwitch(swname);
                          return true;
                        }
                    ,
                   
                    queues,
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
                        setSwitch:function (ctlpack,topic, topicNodeRed,pubtopic){// will links topics and related ha entity triggers,changes
                                                          //  * ha >> fv3 :
                                                          //    - (type 3,4?) : add a ws listener for the state-changed entity (button/switch) on associated ha entity to fill the corresponding dev queue  
                                                          //      or
                                                          //    - (type 1,2): add ws listener  for the state-changed entity (button/switch) used to send cmd topic, on associated ha entity : 
                                                          //      directly to cmdtopic interrupt that will call a manual(user/external request/cmd) algo object   
                                                          //          >>> nb type 1,2 dont fill dev queue because the proposal to change fv3 state must be done as cmd topic
                                                          //  * fv3 >> ha 
                                                          //  - will return the writeWs func to call from writeSync to trigger ha associated switch change 
                                                          //    the name dev will be mapped to ha entity ent provided by customer in models numbSubscr,,, or something else

                                                          //  nb from fv3 , ex from models.js we get the associated ha entity and its cmd topic entity

                        let cfg=ctlpack.ctl.cfg,type=ctlpack.ctl.cl,portid=ctlpack.ctl.gpio;

                        let {eventMng='mqtt',haEntity,haManButton}=cfg;
                          let cndEnt=haManButton,ent=haEntity;

                          // now 
                          // - foreach dev type we must simulate the mqtt message handler call client.on('message',msgList=function (topic, message, packet) 
                          //    that, using mqtt, would be pub on a topic from ha after a change on corresponding dev entity in ha (  entity( switch/sensor) ,cmd topic button x fire interrupt) on dev topic or cmdtopic
                          //    compreso il dev type 0 that is a dev that receives cmd topic whose interrupt call a subset of browser ws emit events
                          //    >> in pratica ha deve mandare via wsclient nel handler msgList  i msg sui topic che i dev si aspettano come avviene usando mqtt client !
                          //        in sostanza i topic sono :
                          //              per il type 3 probe il  topic
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
                                        // usually not all type has  cmdent , ex type 3
                                        //  type 1 and 2 and 4 and 0  are usually not interested to track the topic state of real entity ent on ha
                                        //  
                        //
                        let hasent=false,hascmdent=false;
                        if(cmdent==null||Actstates[cmdent]==true) hascmdent=true;// already registered
                            else  Actstates[cmdent]=true;
                        if(ent==null||Actstates[ent]) hasent=true;// already registered
                        else  Actstates[cmdent]=true;
                        if(hascmdent&&hasent)return false;

                          // if want present value : 
                          //  inState=await client.getStates();// store updated  state values inState[name];// start tracking the state with t
                          //  ctlcb(name,inState[name]);

                         // nb this client is the haws client , not the custom ws client in haWs!
                        client.on('state_changed', (stateChangedEvent) => {// future changes 
                          if(!hascmdent&&stateChangedEvent.data.entity_id==cmdent){//  changes on cmdent entity 
                          console.log(' rssi manual button state_changed event update (button press or its automation firing an event)  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state);
                          // ctlcb(name,stateChangedEvent.data.new_state.state);// B)
                          ctlcb(topicNodeRed,stateChangedEvent.data.new_state.state);// changes of cmdent will pub  new val on topicnodered , so incoming process handler will receive val on the dev cmdtopic 
                          // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                          } else if(!hasent&&stateChangedEvent.data.entity_id==ent){
                            console.log(' rssi manual button state_changed event update (button press or its automation firing an event)  ',stateChangedEvent,',\n new value: ',stateChangedEvent.data.new_state.state);
                            // ctlcb(name,stateChangedEvent.data.new_state.state);// B)
                            ctlcb(topic,stateChangedEvent.data.new_state.state);// // changes of ent will pub new val on topic , so incoming process handler will receive val on the dev topic 
                            // this.queue.push(stateChangedEvent.data.new_state.state);// A)
                            }
                          });
                            // fv3 dev are write(d using writesync that pub a val on dev pubtopic to change the state of dev that gives values publishing on  dev topic:
                            //      .pub('pubtopic',val)
                            //          nb some dev type, like 2 ( not in  4 ? ) , pubtopic=topic so simulate a real switch device that pub on topic (so fill dev queue (the dev state)) just the val it was comanded using pubtopic
                            // in haWs we are using haws instead of mqtt, so we build a custom ws client (wsclient) that when .pub on a pubtopic/topic must change the associated ha switch like when it was done using mqtt:
                            //  >> so in wsclient when we .pub a topic we must do the same of the mqtt handler called becaused subscribed  on the dev pubtopic :
                            //      change the dev associated switch state !
                            //  so  on caller set :swclient.pubs[pubtopic]= the handler HHSS
                            //    that handler will be called when writesync calls wsclient.pub('thedev_pubtopic',val)

                          // associate ent='rssi'  is usually a ha switch
                          if(portid!=777)
                          return function (val) {// HHSS : will trigger update of entity ent when writesync pubs on  dev pubtopic for type 1 and 2 and 4?:
                                                // usually the ha entity ent is reading state from real device topic and pub on pubtopic to real device when we manually switch the device
                                                // so this func will be called when client.pub('topic',val) call with topic= the registered pubtopic on this device , see XXFF  
                            // if a number
                            
                            let act;
                            if (val==1)act=ON;else act=OFF;
                            docmd('ser','switch',act,'switch.'+ent);
                          };// call f('switch','turn_on','switch.rssi'
                          else{// portid=777 todo  state dev: fill all std entity that depend on state var found on dev topic 

                          }
                        }else{// todo other type/ portid=777 the state dev 
                          /* mosquitto_sub -t @Casina_API@ctl_var_state_0   -u sermovox -P sime01 -h bot.sermovox.com -p 1883
                          {"payload":{"state":{"anticipate":true,"program":true,"battery":1,"inverter":0,"desTemp":20,
                          "relays":{"heat":false,"pdc":false,"g":false,"n":false,"s":false,"split":false,"gaspdcPref":false,"acs":true}}},"sender":{"plant":"Casina_API","user":777}}
                          // so no need to customize acs,battery,inverter,desTemp :



                          */

                        }
                    },
                    setCmdInterf:function (name,startcmdentity,stopcmdentity,ent){// see  WSTMS . ent : the entity associated to algoo state , startcmdentity and stopcmdentity the button entity to stat stop the service 
                                          // see WQSD

                      //  * start/stop algo cmd ha >> fv3 event handler called using a interface device ( the cmd topic will call a ws event handler as interrupt) :
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

                      //    todo review this:
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
                    getCon:function(){// start connection 
                       kepAlive(true);
                        return { ws,// gethasscon=haws.getCon();   ws=gethasscon.ws() ; if(ws)ws.....()
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