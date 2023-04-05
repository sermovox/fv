let fs = require('fs'); //require filesystem module. or add a init:(fs_)=>{fs=fs_;return this;}
let prettyJSONStringify = require('pretty-json-stringify');
const toprjdit='/../../'// from this dir to project dir
const api={// see https://javascript.info/promise-chaining

    // this will recover the data to un execute processes ( data/session for navigation among execute chains )
  
    loadScriptsFromFile : function(plantcfg,plantcnt,plantconfig,ctl) {// src: file name key, ctl : controller 
                                              //  >>>  status will be recovered, or defined for a new plant instance,  and assigned to ctl 
                                              // will return an updated ctl.state
  
  /* suggestion : but use sync version !
  //checks if the file exists. 
  //If it does, it just calls back.
  //If it doesn't, then the file is created.
  function checkForFile(fileName,callback)
  {
      fs.exists(fileName, function (exists) {
          if(exists)
          {
              callback();
          }else
          {
              fs.writeFile(fileName, {flag: 'wx'}, function (err, data) 
              { 
                  callback();
              })
          }
      });
  }
  
  function writeToFile()
  {
      checkForFile("file.dat",function()
      {
         //It is now safe to write/read to file.dat
         fs.readFile("file.dat", function (err,data) 
         {
            //do stuff
         });
      });
  }
  
  */
      return new Promise(function(resolve, reject) {
          let scripts,// the readed file
          file;
          // if(src=='scripts')file='scripts';else if(src=='projects')file='projects';
          // file=__dirname +// this dir name 
          file=__dirname +toprjdit+// from this dir to project dir
          process.env.PersFold+// location of states/scripts
          plantcfg.name+// // should be = LLII  ='MarsonLuigi_API'
          '.json';
          if (file&&fs.existsSync(file)) {
              try {
                  scripts = require(file);
              } catch(err) {
                  return reject('Cannot load scripts from file: ' + err.message);
              }/*
          } else {
              console.warn('cant find a data json obj: ',src);
  
          }
          if (fs.existsSync(src1)) {
              try {
                  unitlist = require(src1);
              } catch(err) {
                  return reject('Cannot load scripts from file: ' + err.message);
              }
          } else {
              console.warn('cant find a data json obj: ',src1);
  
          }
          if (fs.existsSync(src2)) {
              try {
                  servicelist = require(src2);
              } catch(err) {
                  return reject('Cannot load scripts from file: ' + err.message);
              }*/
  
              // update the staus on basic ctl
  
              ctl.state=scripts;
          } else {//  >>>  status cant be recovered so keep the basic status of ctl  and complete it
  
            //  console.log('loadScriptsFromFile , cant find a data json obj: ',file,' , so crete a basic state from ctl: ',ctl);
              ctl.state.app.plantcfg=plantcfg;// add to new std state the plant cfg
              ctl.state.app.plantname=plantcfg.name;// rindondante , giusto per compatibilita vecchia versione !!!!
              ctl.state.app.plantcnt=plantcnt;// ex ejs context to generate pump list in browser
              ctl.state.app.plantconfig=plantconfig;
  
              // was:
             // scripts=ctl.state;
            
             // add relays status (false or look at present gpio ???????????????) 
  
            // òòòòòòò   .....
             // todo 19032023 : usare i cfg (relaisEv .....) in status piuttosto che quelli app wide nella prima imlementazione !!!
             plantconfig.relaisEv.forEach((pump,ind) => {// ['pdc',// socket event to sync raspberry buttons and web button
              // 'g','n','s']
              ctl.state.relays[pump]=false;//  (false or look at present gpio ???????????????) 
              });
  
  
              console.log('loadScriptsFromFile, cant find a data json obj: ',file,' , so crete a basic state: ',ctl.state);
  
  
  
          }
  
          //PATH_TO_SCRIPTS = src;api.mapTriggers();
          console.log('loadScriptsFromFile , resolving scripts: ',scripts);
          resolve(ctl);
      });
  },
  
  writeScriptsToFile : function(fn,fromcaller) {// write to file_=fn.state.app.plantname  only on scripts and projects, fn=ctl
                                                // send state to browser using socket :fn.socket.emit('status
  
                                      // piacerebe scrivere lo status su file a anche mandare via websoket, del ctl, lo status al browser
                                      // tuttavia se lo status esiste in file per un plant il ctl viene creato dopo ???? 
                                      // todo   for debug just add fromcaller in param !
  
  
  
    const new_scripts=fn.state,
    file_=fn.state.app.plantname;// should be = LLII
    //fn.socket.emit('status',JSON.stringify(fn.state,null,2));// send the status to the browser too, also if the related section is not jet visible !
    let prettyjson=prettyJSONStringify(fn.state, {
      shouldExpand : function(object, level, key) {
          if (key == 'lastT'||key=='TgiornoToll'||key=='probes'||key=='execute'||key=='PMCgiorno'||key=='relays'||key=='pumpMap') return false;
          if (key == 'doExpand') return true;
          if (Array.isArray(object) && object.length < 8) return false;
          if (level >= 3) return false;
          return true;
      }
  });
  console.log('sendstatus() pretty is: ',prettyjson);
    fn.socket.emit('status',fn.state,prettyjson);// send the status to the browser too, also if the related section is not jet visible !
  
    return new Promise(function(resolve, reject) {
          let bank,file;
          //console.log('writescript: file ',file,' starting .... ',new_scripts);
          if(file_){
          // file=__dirname +// this dir name 
          file=__dirname +toprjdit+// from this dir to project dir
          process.env.PersFold+// location of states/scripts
          file_+'.json';
         // console.log('writescript: file ',file,' writing .... ');
          try {
              require('fs').writeFileSync(file, JSON.stringify(new_scripts,null,2));
            //  console.log('writescript: file ',file,' writed ')
          } catch(err) {
              return reject('Cannot write scripts to file: ' + err.message);// return what ?
          }
  
         // api.mapTriggers();
         let  pdate=new Date();pdate.setHours(pdate.getHours()+1);console.log('writeScriptsToFile(): updated',new_scripts,' on : ',pdate);//  (new Date()).toLocaleString()
          resolve(new_scripts);
      }else reject('file is undefined');
      });
  
  } 
  };
  module.exports =api;