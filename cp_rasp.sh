#!/bin/bash
# cd ~/localdev/raspexampl/fv
# ( sshfs pi luigi  on /pimount) 
# use : ./cp_rasp.sh 01312022
# manca models.js ovviamente, .env, 
# to add : rest.js,app2?,,custDevDef,
declare -a arr=("mqtt.js" "nRsocket.js" )

# cp_rasp 31122021
MD="/home/luigi/pimount/luigi/localdev/fv20/saveFV/saved_"
slash="/"
# savdir:
mydir=$MD$1$slash
nat="nat/"
io="io/"

pages="pages/"
pages_="views/pages/"
mydir_nat=$mydir$nat
mydir_io=$mydir_nat$io
mydir_pages=$mydir$pages

# basedir to update
bdir="/home/luigi/pimount/luigi/localdev/fv20/"
bdir_nat=$bdir$nat
fv3="fv3.js"
bdir_io=$bdir_nat$io
bdir_pages=$bdir$pages_
getio="getio.js"
ioread="ioreadwritestatus.js"
exindex="exindexhtml.ejs"

# todo add nat/models.js



  echo "Directory $MD not exists ! so it will be created, after please run again this .sh " 

echo \"mkdir -p $mydir \"
mkdir -p $mydir

 echo \" cp -n $bdir$fv3  $mydir\"
 cp -n $bdir$fv3  $mydir
 echo \"rm -f $bdir$fv3 \"
 rm -f $bdir$fv3 
 echo \" cp  ./$fv3 $bdir  \"
  cp  ./$fv3 $bdir 
  
  echo \" now nat dir \"
 echo \" mkdir -p $mydir_nat  \"
 mkdir -p $mydir_nat 
	for i in  ${arr[*]}
	do 
		 echo \" cp -n  $bdir_nat$i  $mydir_nat \"
		 cp -n  $bdir_nat$i  $mydir_nat
		 echo \"rm -f $bdir_nat$i \"
		 rm -f $bdir_nat$i 
		 echo \" cp   ./nat/$i  $bdir_nat \"
		 cp   ./nat/$i  $bdir_nat

	done
  echo \" now io dir \"
echo \"mkdir -p $mydir_io \"
mkdir -p $mydir_io
 echo \" cp -n $bdir_io$getio  $mydir_io \"
 cp -n $bdir_io$getio  $mydir_io 
 echo \"rm -f $bdir_io$getio  \"
 rm -f $bdir_io$getio
 echo \" cp  ./nat/io/$getio $bdir_io  \"
 cp  ./nat/io/$getio $bdir_io 

 echo \" cp -n $bdir_io$ioread  $mydir_io \"
 cp -n $bdir_io$ioread  $mydir_io
 echo \"rm -f $bdir_io$ioread  \"
 rm -f $bdir_io$ioread 
 echo \" cp  ./nat/io/$ioread $bdir_io  \"
  cp  ./nat/io/$ioread $bdir_io 

  echo \" now pages dir \"
echo \"mkdir -p $mydir_pages \"
mkdir -p $mydir_pages 
 echo \" cp -n $bdir_pages$exindex  $mydir_pages \"
 cp -n $bdir_pages$exindex  $mydir_pages
 echo \"rm -f $bdir_pages$exindex   \"
 rm -f $bdir_pages$exindex 
 echo \" cp  ./views/pages/$exindex $bdir_pages  \"
 cp  ./views/pages/$exindex $bdir_pages 

