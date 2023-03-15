// see models in mvc : https://progressivecoder.com/how-to-create-a-nodejs-express-mvc-application/

// add wuawey passw 
/*

      //"userName":"MarsonLuigi_API",
      "systemCode":"Huawei@123" // put in .env
    url='https://eu5.fusionsolar.huawei.com/thirdData/login',
*/
let
cfgluigi={ plants:['MarsonLuigi_API'],
        apiPass:'xxxx',// to do
      gpionumb:[12,16,20,21,26,19,13,6],
      mqttnumb:[11,null,null,null,null,null,null,null],
      relaisEv:['heat','pdc','g','n','s','split'],// // >>>>>>>>> todo   add here and in fv3 a new item : heatht !!!!!!!!!!!!!!
                                                // //  relays : https://www.norobot.it/nascondere-e-mostrare-elementi-in-una-pagina-web/#btn001
      // titles:["HEAT Low Temp","HEAT High Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      titles:["HEAT Low Temp"," PdC (vs GAS)","g"," Zona Notte"," Seminterrato"," Splits"],
      devid_shellyname:{11:'shelly1-34945475FE06'}
      };
let users={luigi:{cfg:cfgluigi,
                name:"luigi",
                passord:"marson",
                email:'luigi.marson@gmail.com'
                }
};

function getcfg(user){// // general obj to customize the  app :functions, generator (ejs) ,,,,, 
            return users[user].cfg;
        }
function getuser(user){
            let usr={user:users[user].name,password:users[user].password,email:users[user].email};
                usr.cfg=null;
        }
function getconfig(user='luigi'){// general obj to customize the  app functions 
                return {gpionumb_:users[user].cfg.gpionumb,
                        mqttnumb_:users[user].cfg.mqttnumb,
                        relaisEv_:users[user].cfg.relaisEv,
                        devid_shellyname_:users[user].cfg.devid_shellyname
                }
            }


// ejs generator contexts
function ejscontext(user){
        let cont={};
cont.pumps=getprods(user);
return cont;

}

function getprods(user){
let relaisEv=users[user].cfg.relaisEv,
titles=users[user].cfg.titles;

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
        getuser,// user staff
        ejscontext};// ejs context
   //     devid_shellyname,gpionumb,mqttnumb,relaisEv
