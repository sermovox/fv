const messageOn = 'on', messageOff = 'off';
let valCorrection,mqttInst;
module.exports = 
/*
{// writed msg on topic
    
    write:// dev writes on a topic or (if not null) pubtopic :
        //       >> we use pubtopic only in type 1 , protocol shelly   , 
        //          according with content of mqttTopPub/mqttTop 

        //    nb all topics(topic,pubtopic,cmdtopic) are defined in numbSubscr/probeSubscr depending on type and protocol
        //          and put into mqttTopPub/mqttTop and invTopic 
        //         
         [null,// type 0
            function(protocol,intval){// the opposite of relay state   0 <> 1 
                let message='';
                if(protocol=='shelly'){
                if (intval == 0) message = messageOff; else message = messageOn;}
                    return message;},
                varf,
                null,
                varf
                ]

}*/

// old : better do a init to do a instance to set also mqttInst, so a ref to specific plant info (to send plant attributes in dev cmd topic !!!!)

{
    setValC(valCorrection_) {
        valCorrection = valCorrection_;
        return this;

    },
    topicMsg: // will be set as property of ctl so here the context this is the ctl itself!
        // dev writes on a topic or (if type 1 ) on pubtopic :
        //       >> we use pubtopic only in type 1 , protocol shelly   , 
        //          according with content of mqttTopPub/mqttTop 

        //    nb all topics(topic,pubtopic,cmdtopic) are defined in numbSubscr/probeSubscr depending on type and protocol
        //          and put into mqttTopPub/mqttTop and invTopic 
        //    
        function (val_) {// from the ha entity val , build the message depending on the type this.cl
            return bank[this.cl](this.cfg.protocol, this.mqttInst.plantName, val_, this.gpio);// this.cl=type, gpio = portid
        },
    // cmdtopicMsg: async function (url, event = null, param = null, val_ = 0, entStates, trackEnt, user = 'extctlId') {// there must be a url/inthandler registered on goonP() that maps the cmdtopic msg to a interrupt handler 
    cmdtopicMsg: async function (url, event = null, param = null, ent,inState, user = 'extctlId',Actstates,Ent_Prefix) {// there must be a url/inthandler registered on goonP() that maps the cmdtopic msg to a interrupt handler 
                                                                                                                    //  we build the def msg x a cmdtopic msg from :
                                                                                                                    //  - url =setMan/mqttxwebsock
                                                                                                                    //  - event
                                                                                                                    //  -val
                                                                                                                    //  nb entStates is a array containing 

        // url can be avoid if it is unique for a portid (ex setMan if portid!=0 )
        // entStates are the current state of entity in ha, ex to start pro
        // ext ctl like node red use cmdtopic to influence the fv3 algo impacted by the dev. cmdtopic in income will interrupt with a handler that will
        //      process the msg with right format . the handler is designed to influence the running algos by a ext ctl event related to the device dev
        //          ex: the ext ctl wants to change the intermediate var type 2 (with state ) calculated by algos !  
        //      to get the msg just call ctl.cmdtopicMsg(0/1)

        // ** the msg to pass to interrupt handler of the dev has a std format depnding on url  interrupt handlers , so format depends on :
        //  - url (the handled interface  designed to respond to this dev cmdtopic to call ) and event (the specifiv uri/handler, like a appended /somerestcomand)
        //  - not from the dev type and protocol !!! ...   , 
        //      >>>  see income processing :isCmdTopic 
        //      >>    in incoming the  msg.url must address the correct handler , see isCmdTopic !!
        // type 0,1,2
        /* eex:
        
        
        topic: '@Casina_API@interface_mqtt_websock_0/NReadUser/cmd'
        payload: >
            {"payload":1,"sender":{"plant":"Casina_API","user":77},"url":"mqttxwebsock","event":"repeatcheckxPgm","data":{{ states.sensor.startprogrammer.state }},
                    "param":{"ei":"S","state":"{{ states('input_boolean.savingsservice') }}"}}


        nb >>>>> the event (repeatcheckxSun.../on/off) to run on entity input_button...  is set according to models.js , see : 
                this.mqttWebSock=        {portid:0,subtopic:'mqtt_websock_',varx:0,isprobe:false,clas:'int',protocol:'mqttxwebsock',
      
                                  haManButton:[['input_button.'+Ent_Prefix+'start_savingservice','repeatcheckxSun'],// >>> entity start_savingservice firing event repeatcheckxSun, on url related to cmdtopic 
                                  ['input_button.'+Ent_Prefix+'stop_savingservice','stopcheckxSun'],
                                  ['input_button.'+Ent_Prefix+'start_progservice','repeatcheckxPgm'],
                                  ['input_button.'+Ent_Prefix+'stop_progservice','stopcheckxPgm']

        **************************     todo continue below   

        - cmd topic launched by (intermediated) var dev type 2 or type 1 dev . in goonP(), see // isCmdTopic :
            >>  we launch the handler registered on ctl  for the url requested (setMan) 

            the handler will influence the algos asking to set the dev in consolidate x some time instead of the value assigned by the algo:
                setManual (pump, val_,"ext cmd",checked_,eM,hour); (consolidate will reveive the request of a setMan on dev of type 1,2 (with state))
                example : 
                topic: '@Casina_API@ctl_var_gas-pdc_4/NReadUser/cmd'
                payload: >
                    {"payload":1,"sender":{"plant":"Casina_API","user":1055},"url":"setMan","checked":1,"data":{{ states.input_number.hour.state}}}

                topic: 'shellies/_shelly1-34945475DD63/relay/0/NReadUser/cmd'
                payload: >
                    {"payload":1,"sender":{"plant":"Casina_API","user":1055},"url":"setMan","checked":1,"data":{{ states.input_number.hour.state }}}
        */

        const val_=inState[ent];// must be :  Actstates.indexOf(ent) < 0 ==true
        if (this.cl > 0 || this.cl < 3) {
            if (!url || url == 'setMan')// per ora i type 1,2 possono solo emettere url=setMan
                if (event == 'on') return JSON.stringify({ payload: 1, sender: { plant: this.plantName, user, url: 'setMan', checked: 1, data: 'somedata' } });
                else if (event == 'off') return JSON.stringify({ payload: 0, sender: { plant: this.plantName, user, url: 'setMan', checked: 1, data: 'somedata' } });
        } else if (this.cl == 0) { //
            // really insert a case x each  event
            if (!url || url == 'mqttxwebsock') { // per ora i type 0 possono solo emettere url=mqttxwebsock
                /* remember the corrispondence   entity - event in this type of haManButton : GHOP
                    >>>>  the entity fire an event and send the std formatted msg ( with url,event, value) on the dev cmd topic so will be received by the dev interrupt handler :
                          ex:   msg={
                                 payload: val_, sender: { plant: this.plantName, user }, url: "mqttxwebsock", event, data: entdata,
                                 param: 'futureuse'
                                }

                "haManButton": [
                    [
                      "input_button.£start_savingservice",
                      "repeatcheckxSun"
                    ],
                    [
                      "input_button.£stop_savingservice",
                      "stopcheckxSun"
                    ],
                    [
                      "input_button.£start_progservice",// ex : input_button.casinauser1_start_progservice    £ws_startprogramming_service
                      "repeatcheckxPgm"
                    ],
                    [
                      "input_button.£stop_progservice",
                      "stopcheckxPgm"
                    ]
                  ]
                  for example the entity input_button.£start_progservice" will fire a cmdtopic with url 'mqttxwebsock' and event "repeatcheckxPgm" 
                  */

                const  payloadstart=1,payloadstop=0;// 0/1 fixed value in this msg

                if (event = 'repeatcheckxPgm') {// entity input_button.£start_progservice launch this event repeatcheckxPgm
                                                // to send a message to process the event by the handler of cmdtopic
                                                // 
                   //   let entdata = entStates('sensor.startprogrammer')
                   //   if (!entdata) entdata = await trackEnt(entdata);

                   console.log(`msgFormat.cmdtopicMsg : a dev registered haManButton ha entity ${ent}is firing event ${event} so sending msg on dev cmdtopic using some event associated ha entities`);
                   
                   // todo manca : condition: "{{ states.input_text.casinauser1_pgmrun.state == 'OFF'}}"

                    // 
                    let startprogrammerVal,startprogrammer;// entities with their value used to build the msg , can be a template entity that is build from other entities !
                    if(Ent_Prefix){// the user ha plant config has entityname generated from a template with a prefix, see HHYY in fv3 
                        startprogrammer='sensor.'+Ent_Prefix+'startprogrammer';
                    }else{
                        startprogrammer='sensor.startprogrammer';
                    }

                   if( Actstates.indexOf(startprogrammer) < 0 )startprogrammerVal=inState[startprogrammer];// must be :  Actstates.indexOf(ent) < 0 ==true
                    else return;

                     // in mqtt impl was :{"payload":1,"sender":{"plant":"Casina_API","user":77},"url":"mqttxwebsock","event":"repeatcheckxPgm","data":{{ states.sensor.startprogrammer.state }},"param":{"ei":"S","state":"{{ states('input_boolean.savingsservice') }}"}}

                   // shoud be : {"payload":1,"sender":{"plant":"Casina_API","user":77},"url":"mqttxwebsock","event":"repeatcheckxSun","data":{{ states.sensor.pippo.state }},"data1":{{ states.input_text.text1.state }},"param":"{{ states('input_boolean.savingsservice') }}"}
                   return JSON.stringify({ payload: payloadstart, sender: { plant: this.plantName, user}, url: "mqttxwebsock", event ,data:startprogrammerVal,param:true});// param is not used 
                    







                } else if (event = 'stopcheckxPgm'){
                    return JSON.stringify({ payload: payloadstop, sender: { plant: this.plantName, user }, url: "mqttxwebsock", event });

                } else if (event = 'repeatcheckxSun'){// use also ent: sensor.pippo,  text1

                    // todo : manca :     condition: "{{ states.input_text.casinauser1_opirun.state == 'OFF'}}"

                    let pippoVal,text1Val,pippo,text1;//// entities with their value used to build the msg , can be a template entity that is build from other entities !
                    if(Ent_Prefix){// the user ha plant config has entityname generated from a template with a prefix, see HHYY in fv3 
                        pippo='sensor.'+Ent_Prefix+'pippo';text1='input_text.'+Ent_Prefix+'text1';
                    }else{
                        pippo='sensor.pippo';text1='input_text.text1';
                    }

                   if( Actstates.indexOf(pippo) < 0 )pippoVal=inState[pippo];else return;// must be :  Actstates.indexOf(ent) < 0 ==true
                    if( Actstates.indexOf(text1) < 0 )text1Val=inState[text1];else return;
                    // in mqtt impl was : {"payload":1,"sender":{"plant":"Casina_API","user":77},"url":"mqttxwebsock","event":"repeatcheckxSun","data":{{ states.sensor.pippo.state }},"data1":{{ states.input_text.text1.state }},"param":"{{ states('input_boolean.savingsservice') }}"}
                   // shoud be : {"payload":1,"sender":{"plant":"Casina_API","user":77},"url":"mqttxwebsock","event":"repeatcheckxSun","data":{{ states.sensor.pippo.state }},"data1":{{ states.input_text.text1.state }},"param":"{{ states('input_boolean.savingsservice') }}"}
                   return JSON.stringify({ payload: 1, sender: { plant: this.plantName, user:777}, url: "mqttxwebsock", event ,data:pippoVal,data1:text1Val,param:true});


                }else if (event = 'stopcheckxSun'){
                    return JSON.stringify({ payload: payloadstop, sender: { plant: this.plantName, user }, url: "mqttxwebsock", event });

                }
            }// else ....
        }
    }
}

 const bank=        [// bank of formatting function for type i dev
         function(protocol,plantName,val_){//// type 0, val_ is integer , the opposite of relay state   0 <> 1 
            let intval=null;if(Number.isInteger(val_))intval=valCorrection(val_);// if val is integer, inverse value 0 <> 1  , because of gpio inversion !!!!
            if(intval==null)return null;
            let message='';
            if(protocol=='mqttxwebsock'){
            if (intval == 0) message = messageOff; else message = messageOn;}
                return message;},

            function(protocol,plantName,val_){// type 1 , val_ is integer  the opposite of relay state   0 <> 1 
                let intval=null;if(Number.isInteger(val_))intval=valCorrection(val_);// if val is integer, inverse value 0 <> 1  , because of gpio inversion !!!!
                if(intval==null)return null;
                let message='';
                if(protocol=='shelly'){
                if (intval == 0) message = messageOff; else message = messageOn;}
                    return message;},
                varf,// type 2
                function(protocol,plantName,val){// type 3  a probe in mqttprob[i] . a ha prob entity will send to fv3 the message as probvalue (on topic ) !

                        return val;},
                varf // type 4
                ]
function varf (protocol,plantName,intval, gpio){// type 2,4
    let message='';
                if(protocol=='mqttstate'){
                message=pub(intval,plantName,gpio);}
                    return message;

}

function pub(load,Plant,portid){// format the msg, inserting , load can be int or obj
                return JSON.stringify({payload:load,sender:{plant:Plant,user:portid}})  ;// user is really portid = dev !!!
         }