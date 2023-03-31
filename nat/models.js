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
        // index : the index of a device 
      gpionumb:[12,16,20,21,26,19,13,6],//  raspberry device info. number is the raspberry gpio , null means no connection to dev available
      mqttnumb:[11,null,null,null,null,null,null,null],// mqtt device info. number is the device id to subscribe
      relaisEv:['heat','pdc','g','n','s','split'],// dev name // >>>>>>>>> todo   add here and in fv3 a new item : heatht !!!!!!!!!!!!!!
                                                // //  relays : https://www.norobot.it/nascondere-e-mostrare-elementi-in-una-pagina-web/#btn001
      // titles:["HEAT Low Temp","HEAT High Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      titles:["HEAT Low Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],// description of device name
      devid_shellyname:{11:'shelly1-34945475FE06'}// mqtt device id , details
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
function getconfig(plant='MarsonLuigi_API'){// general obj to customize the  app functions 
                                // or let{gpionumb,mqttnumb,relaisEv,devid_shellyname}=models.getconfig(plant)=.state.plantconfig;
                                //     after set state.app we can :  let{gpionumb,mqttnumb,relaisEv,devid_shellyname}=plantconfig (=.state.app.plantconfig=
                return {gpionumb:plants[plant].cfg.gpionumb,
                        mqttnumb:plants[plant].cfg.mqttnumb,
                        relaisEv:plants[plant].cfg.relaisEv,
                        devid_shellyname:plants[plant].cfg.devid_shellyname
                }
            }


// ejs generator contexts
function ejscontext(plant){
        let cont={};// ejs context=ejscontext(plant).pumps=[{id,title},,,,]
cont.pumps=getprods(plant);
return cont;

}

function getprods(plant){
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
}
        
module.exports = {getconfig,// app funtionality custom cfg
        getcfg,// all
        getconfig,
        getplant,// user staff
        ejscontext};// ejs context
   //     devid_shellyname,gpionumb,mqttnumb,relaisEv
