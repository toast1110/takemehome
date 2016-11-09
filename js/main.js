var animalData = []

d3.json("animalOpenData.json", function(dataSet){
    console.log("Input Data");
    updateValue(".block-left", animalCnt(dataSet));
    animalData = dataSet;
    
    var aLValue = acceptLastday(dataSet);
    console.log(aLValue);
    updateValue(".block-middle", aLValue);
    
    var kTMValue = killThisMonth(dataSet);
    console.log(kTMValue);
    updateValue(".block-right", kTMValue);
    
    //cityArr: 縣市別陣列(包含重複項目)           
    var cityArr = dataSet.map(function(d){
        return d.shelter_address.substring(0,3);
    });
    //uniquecCityArr: 縣市別陣列(無重複項目) 
    var uniqueCityArr = unique(cityArr);
    //filterCityArr: 縣市別陣列(去除空白項目) 
    var filterCityArr = uniqueCityArr.filter(function(d){
        return d!=""; 
    });
    //cityAnimalCnt: 縣市的流浪動物個數陣列
    var cityAnimalCnt = [];
    for (var i=0; i<filterCityArr.length; i++){
        cityAnimalCnt.push({
            'index':i,
            'city':filterCityArr[i],
            'cnt':0
        });
    }
    console.log(cityAnimalCnt);
    for(var i=0; i<dataSet.length; i++){
        var thisCity = dataSet[i].shelter_address.substring(0,3);
        
        var cityObj= cityAnimalCnt.filter(function(d){
            return d.city===thisCity;
        })[0];
        var p = + cityObj.cnt;
        
        cityAnimalCnt[p].cnt = cityAnimalCnt[p].cnt+1;
    }
    console.log(cityAnimalCnt);
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
function unique(array){
    var n = []; 
    for(var i = 0; i < array.length; i++){
        if (n.indexOf(array[i]) == -1){
            n.push(array[i]);
        }
    }
    return n;
}


//Ｍap Chart
d3.json("topoTaiwan.json", function(topoData){
    bindMap(topoData);
    renderMap();
    console.log("renderAlready");
});
function renderMap(){
    var fScale = d3.scale.category20c();
    d3.selectAll("path")
    .attr({
        fill:function(d,i){
            return fScale(i);
        }
    })
    .on("click",function(d){
        var coordinates = d3.mouse(this);
        var x= coordinates[0];
        var y= coordinates[1];
        var tooltip = d3.select("#tooltip")
                        .style({
                            left: (x+192+10)+"px",
                            top: (y+150+10)+"px"
                        });
        tooltip.select("#city").text(d.properties.C_Name);
        tooltip.select("#industry").text(d.industry);
        d3.select("#tooltip").classed("hidden",false); 
    })
    .on("mouseover",function(d){
        d3.select(this).attr({
            fill:"lightgreen"
        });
    })
    .on("mouseout",function(d,i){
        d3.select(this).attr({
            fill: fScale(i)
        });
    });
}
function bindMap(topoData){
    var projection = d3.geo.mercator().center([123.5,23.5]).scale(6000);
        
    var path = d3.geo.path().projection(projection);
        
    var topo = topojson.feature(topoData, topoData.objects["county"]);
        
    var selection = d3.select("#mapChart").selectAll("path").data(topo.features);
    selection.enter().append("path");
    selection.exit().remove();
    selection.classed("map-boundary", true).attr("d",path);
}

