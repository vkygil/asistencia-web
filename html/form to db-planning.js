//Form to db

var form = $('#my-profile').serializeJSON();
// lunes = form.lunes ...

//a proto function
function chunk (arr, len) {
  var chunks = [],
      i = 0,
      n = arr.length;
  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }
  return chunks;
}



var lunesObj = new Object();
lunesObj.day=1;
lunesObj.time= chunk(form.lunes,3);
var martesObj = new Object();
martesObj.day=1;
martesObj.time= chunk(form.martes,3);
var miercolesObj = new Object();
miercolesObj.day=1;
miercolesObj.time= chunk(form.miercoles,3);
var juevesObj = new Object();
juevesObj.day=1;
juevesObj.time= chunk(form.jueves,3);
var viernesObj = new Object();
viernesObj.day=1;
viernesObj.time= chunk(form.viernes,3);

var time = [];
time.push(lunesObj);
time.push(martesObj);
time.push(miercolesObj);
time.push(juevesObj);
time.push(viernesObj);


var c = 20;
var horasLun= time[0].time.length;
var day=1;
for(i=0; i<horasLun;i++){
    if(c > time[day].time[i][0] && c < time[day].time[i][1]){alert(time[day].time[i][2])}else{}
}

document.getElementById("timeInput").value = JSON.stringify(time);