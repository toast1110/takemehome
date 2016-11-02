
d3.json("animalOpenData.json", function(dataSet){
    console.log("Input Data");
    updateValue(".block-left", animalCnt(dataSet));
    
    var aLValue = acceptLastday(dataSet);
    console.log(aLValue);
    updateValue(".block-middle", aLValue);
    
    var kTMValue = killThisMonth(dataSet);
    console.log(kTMValue);
    updateValue(".block-right", kTMValue);
});

function animalCnt(DS){
    return DS.length;
}
function updateValue(divClass, Value){
    d3.select(divClass)
        .select(".value")
        .text(Value);
}
function acceptLastday(data){
    var acceptLastCnt = 0;
    var ld = lastDay();
    for(var i=0; i<data.length; i++){
        if(data[i].animal_opendate===ld){
            acceptLastCnt = acceptLastCnt+1;
        }
    }
    return acceptLastCnt;
}
function killThisMonth(data){
    var killThisMonthCnt = 0;
    var tm = thisMonth();
    for(var i=0; i<data.length; i++){
        if(data[i].animal_closeddate.substring(0,7)===tm){
            killThisMonthCnt = killThisMonthCnt+1;
        }
    }
    return killThisMonthCnt;
}
function lastDay(){
    var today = new Date();
    today.setDate(today.getDate()-1);
    var lastDay = new Date(today);

    var dd = lastDay.getDate();
    var mm = lastDay.getMonth()+1;
    var yyyy = lastDay.getFullYear();
    
    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    lastDay = yyyy+'-'+mm+'-'+dd;
    return lastDay;
}
function thisMonth(){
    var today = new Date();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    
    var thisMonth = yyyy+'-'+mm;
    return thisMonth;
}