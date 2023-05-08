// see models in mvc : https://progressivecoder.com/how-to-create-a-nodejs-express-mvc-application/

// add wuawey passw 
/*

      //"userName":"MarsonLuigi_API",
      "systemCode":"Huawei@123" // put in .env
    url='https://eu5.fusionsolar.huawei.com/thirdData/login',
*/
let
cfgluigi={ plants_:['MarsonLuigi_API']};
let
cfgMarsonLuigi={ name:'MarsonLuigi_API',// duplicated FFGG
        apiPass:'xxxx',// to do
        // index : the index of a device . iesimo device is got with getctls(x,y) that chooses from iesimo x or y 
        // portid : the id of a device, must be unique >0. 
      gpionumb:[12,16,20,21,26,19,13,6],// (dev id or portid) raspberry device info. number is the raspberry gpio , null means no connection to dev available
      //mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info/id/port. number is the device id to subscribe

      /* mqtt staff 
      mqttnumb,// { portid, varx, isprobe, clas, protocol, subtopic } 
                // config of devices that are relay/var (class=out/var) and follow some protocol (mqttstate (+isprobe in future) for var and shelly for relay) 
               // devices have/map a calculated topics (using subtopic and also varx) according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 

        mqttprob,// { portid, subtopic, varx, isprobe, clas, protocol }  config of devices that are probes/var (isprobe) and follow some protocol (mqttstate for var and shelly for probe) 
                // devices have/map a calculated topics according to protocol and interface (readsync/writesync) versus mqtt topics pub/subscrtipt 
        */ 

      mqttnumb:[{portid:11,clas:'out',protocol:'shelly',subtopic:'shelly1-34945475FE06'},// clas 'out' or 'var' , same dim than gpionumb
                                                                                        // subtopic: other protocol, different from shelly, can have different feature ex subscriptTopic and PubTopic !
      null,null,null,null,null,
      // {portid:10,clas:'var',topic:'gas-pdc',varx:3,protocol:'mqttstate'} ex of 'out' var
      {portid:55,subtopic:'var_gas-pdc_',varx:4,isprobe:false,clas:'var',protocol:'mqttstate'},// a var
      null],// mqtt device info/id/port. number is the device id to subscribe


      mqttprob:[{portid:110,subtopic:'ht-cucina',varx:null,isprobe:true,clas:'probe',protocol:'shelly'},//a probe,  the shelly ht probes to register (read only) 
                                                                                // nbnb clas e isprobe sono correlati !! > semplificare !
                                                                                // clas='var'/'probe'or 'in'

      {portid:54,subtopic:'var_gas-pdc_',varx:3,isprobe:false,clas:'var',protocol:'mqttstate'}],// a var

                // a var  add also write capabiliy , so can be used as gen state var to modify with mqtt app/node red . as mqtt num will ha a frame below relay state in browser !
        

      relaisEv:['heat','pdc','g','n','s','split'
        ,'gaspdcPref'],// dev name x mqttnumb cfg  will appears in browser list of relays // >>>>>>>>> todo   add here and in fv3 a new item : heatht !!!!!!!!!!!!!!
                                                // //  relays : https://www.norobot.it/nascondere-e-mostrare-elementi-in-una-pagina-web/#btn001
      // titles:["HEAT Low Temp","HEAT High Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      titles:["HEAT Low Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"
        ,"gaspdcPref"]//,// description of device name

      // put into mqttnumb !!!
        //devid_shellyname:{11:'shelly1-34945475FE06'// mqtt device id-s/n relais and probes !!!!   , details
                                                // in future we must add cfg data in order to check that the device can be compatible with the type requested (in/out)
                                                // and other cfg data in order to set a customized topic to send/publish and receive/subscribe messages 
                                                //              >>> (now we use a def cfg (out:shelly 1 and in:shelly ht) in mqtt ) 
                                                // 11:{sn:'shelly1-34945475FE06',types:['in,'out'],subscrptiondata:{in:{},out:{},publishcfg:{}}
                        //}
        };
let plants={MarsonLuigi_API:{cfg:cfgMarsonLuigi,// will be put in state.app.plant
                name:"MarsonLuigi_API",// duplicated FFGG
                passord:"marson",
                email:'luigi.marson@gmail.com'
                }
};

function getcfg(plant){// // general obj to customize the  app :functions, generator (ejs) ,,,,, 
            return plants[plant].cfg;
        }
function getplant(plant){
            let usr={user:plants[plant].name,password:plants[plant].password,email:plants[plant].email};
                usr.cfg=plants[plant].cfg;
        }
function getconfig(plant='MarsonLuigi_API'){// =plantconfig, general obj to customize the  app functions 
                                // or let{gpionumb,mqttnumb,relaisEv,devid_shellyname}=models.getconfig(plant)=.state.plantconfig;
                                //     after set state.app we can :  let{gpionumb,mqttnumb,mttprob,relaisEv,plantName}=plantconfig (=.state.app.plantconfig=
                return {gpionumb:plants[plant].cfg.gpionumb,
                        mqttnumb:plants[plant].cfg.mqttnumb,
                        mqttprob:plants[plant].cfg.mqttprob,
                        relaisEv:plants[plant].cfg.relaisEv,
                        plantName:plant
                        // devid_shellyname:plants[plant].cfg.devid_shellyname,
                       // error :  relaisEv:plants[plant].cfg.mqttprob
                }
            }

// ejs generator contexts
function ejscontext(plant){
        let cont={};// ejs context=ejscontext(plant).pumps=[{id,title},,,,]
cont.pumps=getprods(plant);
return cont;
}

function getprods(plant){// prepare the context to expand the plant relais in web page
        if(plants[plant]&&plants[plant].cfg){
let relaisEv=plants[plant].cfg.relaisEv,
titles=plants[plant].cfg.titles;
let prods=[];
if(titles&&relaisEv&&titles.length==relaisEv.length)
        relaisEv.forEach((val,ind)=>{
                prods.push({id:val,
                        title:titles[ind]
                });
        });
else    prods=null;

// ? prods=prods_||prods;// prefer downloaded json 
// ? prods.forEach((pump, ind) =>{pump[ind].id=relaysEv[ind]});
return prods;
}else return null;
}
        
module.exports = {getconfig,// app funtionality custom cfg
        getcfg,// all
        getconfig,
        getplant,// user staff
        ejscontext};// ejs context
   //     devid_shellyname,gpionumb,mqttnumb,relaisEv
