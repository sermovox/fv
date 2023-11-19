#!/usr/bin/env python3
## a simulation  of rs485.py
## python3 rs485.py r addr reg  
##  for text use  addr=44
## ex python3 rs485.py r 2 4098 10
## ex python3 rs485.py w 1 4142 225 writing gradi *10( 225 > 22.5)  se signed
## ex python3 rs485.py w 1 4188 0   unsigned

##  pag  16: MODBUS Data - CVP
##  reg: decimal 
##    r  4098/4100  t1 aria ,t3   hex: 1002/1004
##       4096    unsigned device type(hex 1000): must be hex 5004 for  cvp asyncronous 
##       4111    unsign on/off  0/1   hex 100f

##   r/w
##	4142 wint set
##	4141 sum set    hex: 102d

##  error, dont use :
##	4183  on off     unsigned   ex: 10 57     non va con func 3  ( solo w) spec p. 20 
##	4185  0 auto, 1,2,3 fan speed  unsigned

##  w
##      4188  on off     unsigned   ex: 10 5c     non va con func 3  ( solo w) spec p. 20 
##      4190  0 auto, 1,2,3 fan speed  unsigned   ex 105e


## addr
##	4 corr notte
##	2 corr cucina 
##	3  sala 
##      studio 5
##	8 garage
##	9 tav



##import minimalmodbus
import sys

rw=(sys.argv[1])
addr=int((sys.argv[2]))
reg=int((sys.argv[3]))
val=int((sys.argv[4]))
sign=True
done=False


##instrument = minimalmodbus.Instrument('/dev/ttyUSB0', addr, debug = True)  # port name, slave address (in decimal)
##instrument.serial.baudrate = 9600
## print('485 setting: ',instrument)
## instrument.serial.parity = minimalmodbus.serial.PARITY_EVEN
##print('modified 485 setting: ',instrument)

## Read temperature (PV = ProcessValue) ##
if rw == "r":
  print("reading address ",addr," , register ",reg)
  temperature = "null"
  
  if reg == 4183 or reg == 4184 or reg == 4185  or reg == 4096 or reg == 4187 or reg == 4190 or reg == 4111 :
    temperature = 21.12 ##instrument.read_register(reg, 0,3,False)  # Registernumber, number of decimals, func=3 , signed
    sign=False
  else :
    temperature = 21.13 ##instrument.read_register(reg, 1)  # Registernumber, number of decimals

  ##temperature = instrument.read_registers(reg, 3)  # Registernumber, number of register>
  print("read address ",addr," , register ",reg,", (hex: ",hex(reg),"), value: ",temperature)
  print(" is probably a signed integer? : ",sign)
  if sign == False :
    print("  unsigned hex val is: ",hex(temperature))
  ## check if null or error !
  sys.stderr.write(str(temperature));



## Change temperature setpoint (SP) ##
if rw == "w":
  if reg == 4188 or reg == 4190 or reg == 4141 or reg == 4142 or reg == 7788 :

    print("writing")

    if  reg == 4141 or reg == 4142 or reg == 7788 : ## signed  usually int*10,    7788 is debug
      done=True
      ##instrument.write_register(reg, val, 0,6,True)  # Registernumber, value, number of decimals for 
      sign=True
    else :
      if  reg == 4188 or reg == 4190 : ## un signed    
        done= True
        ##instrument.write_register(reg, val, 0,6,False)  # Registernumber, value, number_of_decimals: int = 0, functioncode: int = 6, signed: bool = False
        sign=False



    ##°  instrument.write_register(reg, val, 1)  # Registernumber, value, number of decimals for storage 
    print("written: ",done," ;  address: ",addr,",  register: ",reg," (hex: ",hex(reg),"), val: ",val)
    if sign == False :
      print("  unsigned hex val is: ",hex(val))
    else :
      print("  signed value 1 decimal")
 
    sys.stderr.write('ok');

