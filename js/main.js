var animalData = []

d3.json("animalOpenData1113.json", function (dataSet) {
    updateValue(".block-left", animalCnt(dataSet));
    animalData = dataSet;

    var aLValue = acceptLastday(dataSet);
    updateValue(".block-middle", aLValue);

    var kTMValue = killThisMonth(dataSet);
    updateValue(".block-right", kTMValue);

    //cityArr: 縣市別陣列(包含重複項目)           
    var cityArr = dataSet.map(function (d) {
        return d.shelter_address.substring(0, 3);
    });
    //uniquecCityArr: 縣市別陣列(無重複項目) 
    var uniqueCityArr = unique(cityArr);
    //filterCityArr: 縣市別陣列(去除空白項目) 
    var filterCityArr = uniqueCityArr.filter(function (d) {
        return d != "";
    });
    //cityAnimalCnt: 縣市的流浪動物個數陣列
    var cityAnimalCnt = [];
    for (var i = 0; i < filterCityArr.length; i++) {
        cityAnimalCnt.push({
            'index': i,
            'city': filterCityArr[i],
            'cnt': 0,
            'pieObj': [{
                "cate": "狗",
                "cnt": 0
            }, {
                "cate": "貓",
                "cnt": 0
            }, {
                "cate": "其他",
                "cnt": 0
            }]
        });
    }
    cityAnimalCnt = cityAnimalCnts(dataSet, cityAnimalCnt);
    console.log(cityAnimalCnt);
    
    //Ｍap Chart
    d3.json("topoTaiwan.json", function (topoData) {
        bindMap(topoData, cityAnimalCnt);
        renderMap(cityAnimalCnt,dataSet);
        console.log("renderAlready");
    });
    
    //Bar Chart
    for(var i=0; i<dataSet.length; i++){
        var month = dataSet[i].animal_createtime.substring(5,7);
        var year = dataSet[i].animal_createtime.substring(2,4);
        var monthNum = parseInt(month);
        if (monthNum<4){
            dataSet[i].yearQ = "Q1'"+year;
        }else if(monthNum<7){
            dataSet[i].yearQ = "Q2'"+year;
        }else if(monthNum<10){
            dataSet[i].yearQ = "Q3'"+year;
        }else{
            dataSet[i].yearQ = "Q4'"+year;
        }
    }
    var quarterAnimalCnt = quarterAnimalCnts(dataSet);
    console.log(quarterAnimalCnt);
    bindBar(quarterAnimalCnt);
    
});


function quarterAnimalCnts(dataSet){
    //quarterArr: 每一季別陣列(包含重複項目)           
    var quarterArr = dataSet.map(function(d){
        return d.yearQ;
    });
    //uniquecQuarterArr: 每一季別陣列(無重複項目) 
    var uniqueQuarterArr = unique(quarterArr);
    //filterQuarterArr: 每一季別陣列(去除空白項目) 
    var filterQuarterArr = uniqueQuarterArr.filter(function(d){
        return d!=""; 
    });
    //quarterAnimalCnt: 每一季的流浪動物個數陣列
    var quarterAnimalCnt = [];
    for (var i=0; i<filterQuarterArr.length; i++){
        var year = filterQuarterArr[i].substring(3,5);
        var q = filterQuarterArr[i].substring(1,2);
        quarterAnimalCnt.push({
            'index':i,
            'quarterRank':parseInt(year+q),
            'quarter':filterQuarterArr[i],
            'cnt':0,
            'dogCnt':0,
            'catCnt':0,
            'otherCnt':0,
            'barObj':[{
                "cate":"狗",
                "cnt":0
            },{
                "cate":"貓",
                "cnt":0
            },{
                "cate":"其他",
                "cnt":0
            }]
        });
    }
    //計算每季流浪動物數量
    for(var i=0; i<dataSet.length; i++){
        var thisQuarter = dataSet[i].yearQ;
        var animalType = dataSet[i].animal_kind;
        
        var quarterObj = quarterAnimalCnt.filter(function(d){
            return d.quarter===thisQuarter;
        })[0];
        if(typeof quarterObj !== "undefined"){
            p = quarterObj.index;
            quarterAnimalCnt[p].cnt = quarterAnimalCnt[p].cnt+1;
            
            switch (animalType) {
                case '狗':
                    quarterAnimalCnt[p].barObj[0].cnt = quarterAnimalCnt[p].barObj[0].cnt+1;
                    quarterAnimalCnt[p].dogCnt = quarterAnimalCnt[p].dogCnt+1;
                    break;
                case '貓':
                    quarterAnimalCnt[p].barObj[1].cnt = quarterAnimalCnt[p].barObj[1].cnt+1;
                    quarterAnimalCnt[p].catCnt = quarterAnimalCnt[p].catCnt+1;
                    break;
                default:
                    quarterAnimalCnt[p].barObj[2].cnt = quarterAnimalCnt[p].barObj[2].cnt+1;
                    quarterAnimalCnt[p].otherCnt = quarterAnimalCnt[p].otherCnt+1;
            }   
        }
    }
    quarterAnimalCnt = quarterAnimalCnt.sort(function (a,b){
        return d3.ascending(a.quarterRank, b.quarterRank);
    })
    for(var i=0; i<quarterAnimalCnt.length; i++){
        quarterAnimalCnt[i].index = i;
    }
    return quarterAnimalCnt;
}

function cityAnimalCnts(dataSet, cityAnimalCnt){
    for(var i=0; i<dataSet.length; i++){
        var thisCity = dataSet[i].shelter_address.substring(0,3);
        var animalType = dataSet[i].animal_kind;

        var cityObj = cityAnimalCnt.filter(function (d) {
            return d.city === thisCity;
        })[0];
        if (typeof cityObj !== "undefined") {
            p = cityObj.index;
            cityAnimalCnt[p].cnt = cityAnimalCnt[p].cnt + 1;

            switch (animalType) {
            case '狗':
                cityAnimalCnt[p].pieObj[0].cnt = cityAnimalCnt[p].pieObj[0].cnt + 1;
                break;
            case '貓':
                cityAnimalCnt[p].pieObj[1].cnt = cityAnimalCnt[p].pieObj[1].cnt + 1;
                break;
            default:
                cityAnimalCnt[p].pieObj[2].cnt = cityAnimalCnt[p].pieObj[2].cnt + 1;
            }
        }
    }
    cityAnimalCnt = cityAnimalCnt.sort(function (a, b) {
        return d3.descending(a.cnt, b.cnt);
    })
    for (var i=0; i<cityAnimalCnt.length; i++){
        cityAnimalCnt[i].index = i;
    }
    
    return cityAnimalCnt;
}

function animalCnt(DS) {
    return DS.length;
}

function updateValue(divClass, Value) {
    d3.select(divClass)
        .select(".value")
        .text(Value);
}

function acceptLastday(data) {
    var acceptLastCnt = 0;
    var ld = lastDay();
    for (var i = 0; i < data.length; i++) {
        if (data[i].animal_opendate === ld) {
            acceptLastCnt = acceptLastCnt + 1;
        }
    }
    return acceptLastCnt;
}

function killThisMonth(data) {
    var killThisMonthCnt = 0;
    var tm = thisMonth();
    for (var i = 0; i < data.length; i++) {
        if (data[i].animal_closeddate.substring(0, 7) === tm) {
            killThisMonthCnt = killThisMonthCnt + 1;
        }
    }
    return killThisMonthCnt;
}

function lastDay() {
    var today = new Date();
    today.setDate(today.getDate() - 2);
    var lastDay = new Date(today);

    var dd = lastDay.getDate();
    var mm = lastDay.getMonth() + 1;
    var yyyy = lastDay.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    lastDay = yyyy + '-' + mm + '-' + dd;
    return lastDay;
}

function thisMonth() {
    var today = new Date();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    var thisMonth = yyyy + '-' + mm;
    return thisMonth;
}

function unique(array) {
    var n = [];
    for (var i = 0; i < array.length; i++) {
        if (n.indexOf(array[i]) == -1) {
            n.push(array[i]);
        }
    }
    return n;
}



function renderMap(dataSet,allDataSet) {
    var fScale = d3.scale.category20c();
    var color = d3.scale
        .linear()
        .domain([d3.min(dataSet, function (d) {
                return +d.cnt;
            }),
                       d3.max(dataSet, function (d) {
                return +d.cnt;
            })])
        .range(['#A0A0A2', '#686767']);
    console.log(color(50));

    d3.selectAll("path")
        .attr({
            fill: function (d, i) {
                if (typeof d.animalCnt === "undefined") {
                    return color(0);
                } else {
                    return color(d.animalCnt);
                }
            }
        })
        .on("click", function (d) {
            update(allDataSet,d.properties.C_Name);
        })
        .on("mouseover", function (d) {
            d3.select(this).attr({
                fill: "#FF9F1C"
            });
            var coordinates = d3.mouse(this);
            var x = coordinates[0];
            var y = coordinates[1];
            var tooltip = d3.select("#tooltip")
                .style({
                    left: (x + 192 + 10) + "px",
                    top: (y + 150 + 10) + "px"
                });
            tooltip.select("#city").text(d.properties.C_Name);

            donutChart(d.pieObj);
            //        tooltip.select("#industry").text("總:"+d.animalCnt+"狗:"+d.pieObj[0].cnt+"貓:"+d.pieObj[1].cnt+"其他:"+d.pieObj[2].cnt);
            d3.select("#tooltip").classed("hidden", false);


        })
        .on("mouseout", function (d, i) {
            d3.select(this).attr({
                fill: function (d, i) {
                    if (typeof d.animalCnt === "undefined") {
                        return color(0);
                    } else {
                        return color(d.animalCnt);
                    }
                }
            });
            d3.select("#tooltip").classed("hidden", true);
        });
}

function bindMap(topoData, cityAnimalCnt) {
    var projection = d3.geo.mercator().center([123.5, 23.5]).scale(6000);

    var path = d3.geo.path().projection(projection);

    var topo = topojson.feature(topoData, topoData.objects["county"]);

    for (var i = 0; i < topo.features.length; i++) {
        var thisCity = topo.features[i].properties.C_Name;
        var cityObj = cityAnimalCnt.filter(function (d) {
            return d.city === thisCity;
        })[0];
        if (typeof cityObj !== "undefined") {
            p = cityObj.index;
            topo.features[i].animalCnt = cityAnimalCnt[p].cnt;
            topo.features[i].pieObj = cityAnimalCnt[p].pieObj;
        }
    }

    var selection = d3.select("#mapChart").selectAll("path").data(topo.features);
    selection.enter().append("path");
    selection.exit().remove();
    selection.classed("map-boundary", true).attr("d", path);
}

function donutChart(pieData) {

    bindPie(pieData);
    renderPie(pieData);

    function bindPie(dataSet) {

        var pie = d3.layout.pie()
            .value(function (d) {
                return d.cnt;
            });

        var selection = d3.select("#pieChart")
            .selectAll("g.arc")
            .data(pie(dataSet));

        var g_arc = selection.enter().append("g").attr("class", "arc");
        g_arc.append("path");
        g_arc.append("text");
        selection.exit().remove();
    }

    function renderPie(dataSet) {
        var outerR = 50;
        var innerR = 0;
        var arc = d3.svg.arc()
            .outerRadius(outerR)
            .innerRadius(innerR);

        //        var fScale = d3.scale.category20();
        var fScale = ["#78A1BB", "#BFA89E", "#EBF5EE"];

        d3.selectAll("g.arc")
            .attr("transform", "translate(" + outerR + "," + outerR + ")")
            .select("path")
            .attr("d", arc)
            .style("fill", function (d, i) {
                return fScale[i];
            });

        d3.selectAll("g.arc")
            .select("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            }) //arc.centroid 計算並回傳此arc中心位置
            .attr("text-anchor", "middle")
            .text(function (d) {
                if (d.data.cnt > 0) {
                    return d.data.cate + ":\r\n" + d.data.cnt;
                } else {
                    return "";
                }
            })

    }
}


function bindBar(dataSet){
    var animalCate = ["dogCnt","catCnt","otherCnt"];
    var layers = d3.layout.stack()(animalCate.map(function(c) {
        return dataSet.map(function(d) {
            return {x: d.quarter, y: d[c]};
        });
    }));
    
    var x = d3.scale.ordinal()
            .domain(layers[0].map(function(d){
                console.log(d.x);
                return d.x;
            }))
            .rangeRoundBands([40, 400]);
    var y = d3.scale.linear()
            .domain([0,d3.max(layers[layers.length-1],function(d){
                return d.y0 + d.y;
            })]).nice()
            .rangeRound([60, 460]);
    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("bottom");
    
    var layer = d3.select("#barChart")
                .selectAll(".layer")
                .data(layers).enter().append("g")
                .attr("class","layer")
                .style("fill",function(d,i){
                    var color = ["#F7882F","#F7C331","#F98948"];
                    return color[i];
                });
    layer.selectAll("rect").data(function(d){return d;})
        .enter().append("rect")
        .attr({
            x:function(d){
                return y(d.y0);
            },
            y:function(d){return x(d.x);},
            height: x.rangeBand()-1,
            width: 0
        })
        .transition().duration(1000)
        .attr({
            x:function(d){
                return y(d.y0);
            },
            y:function(d){return x(d.x);},
            height: x.rangeBand()-1,
            width: function(d){return y(d.y + d.y0)-y(d.y0)}
        });
    
    d3.select("#barChart")
      .selectAll("text")
      .data(layers[0]).enter()
      .append("text")
//      .exit().remove()
      .attr({
        x: 5,
        y:function(d){return x(d.x)+20;},
        fill:"#282828",
//        stroke: "#FFFFFF",
        "font-size": 15,
        "font-family": "arial"
      })
      .text(function(d){return d.x});
    
//    d3.select("#barChart")
//      .append("g")
//      .attr("class", "axis")
//      .attr("transform", "translate(0,400)")
//      .call(yAxis);
    
}

function update(dataSet, filteredName){
                
    var filtered_dataSet = dataSet.filter(function(d){
        return d.shelter_address.substring(0,3)===filteredName;
    })
    
    for(var i=0; i<filtered_dataSet.length; i++){
        var month = filtered_dataSet[i].animal_createtime.substring(5,7);
        var year = filtered_dataSet[i].animal_createtime.substring(2,4);
        var monthNum = parseInt(month);
        if (monthNum<4){
            filtered_dataSet[i].yearQ = "Q1'"+year;
        }else if(monthNum<7){
            filtered_dataSet[i].yearQ = "Q2'"+year;
        }else if(monthNum<10){
            filtered_dataSet[i].yearQ = "Q3'"+year;
        }else{
            filtered_dataSet[i].yearQ = "Q4'"+year;
        }
    }
    var quarterAnimalCnt = quarterAnimalCnts(filtered_dataSet);
    console.log("update");
    bindBar(quarterAnimalCnt);
}