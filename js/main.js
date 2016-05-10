google.load("visualization", "1", {packages:["corechart", "treemap"]});
    $( document ).ready(function() {
        $( "#load" ).simpleselect().on('change',function() {
            hours = 36;//$('#hours').val();
            //bib = $('#bib_name').find(":selected").val();
            bib = $(this).val();
            this.blur();
            createGraph(hours,bib);
        });

        $( "#overview" ).on('click',function() {
            createOveriew();

        });

        google.setOnLoadCallback(createOveriew());
        google.setOnLoadCallback(createGraph(36,"LBS"));

      });



     
      
      function createOveriew() {
          
          var url = createUrl('0.5','all');
          var type = 'seatestimate';
          //var type = 'manualcount';
          var dataArr = [['Location', 'Parent', 'Platz-Anzahl', 'Auslastung'],
          ['bib', null, 1,1]];
          jQuery.ajax({
               url:url,
               dataType: 'jsonp', 
               success:function(json){


                  function getCapacity(name) {
                    return $(json[2].location).attr(name)[0].available_seats;
                  }
                  function getCat(name) {
                    return $(json[2].location).attr(name)[0].super_location;
                  }
                   function getName(name) {
                    return $(json[2].location).attr(name)[0].long_name;
                  }

                  console.log(json);
                  var data = [['Time', 'Besetzte Plaetze']];
                  var seats = $.map($(json[0]).attr(type), function(value, index) {
                      return [value];
                  });
                  $(seats).each(function(){
                      var seat = this[0];
                      if (seat) {
                         
                          console.log("slot: ",seat.location_name);
                         
                          var bib = getName(seat.location_name)+'/'+seat.location_name;
                          var cap = getCapacity(seat.location_name);
                          var cat = getCat(seat.location_name);
                          var value = Math.round(seat.occupied_seats/cap*100);
                          var text = '<p>'+seat.timestamp.date +' : '+value+'</p>';
                          dataArr.push([bib, 'bib', cap, value]);
                          }
                  })

                  console.log(dataArr)
                var data = google.visualization.arrayToDataTable(dataArr);
                  drawRadar(data);


               },
               error:function(){
                   alert("Sorry, there was an error receiving the data");
               },
          });
      }

       function drawRadar(data) {

            var radarChartData = {
    labels: ["KIT-EG/1.OG-Alt", "KIT-1.OG-Neu", "KIT-2.OG-Alt","KIT-2.OG-Neu","KIT-3.OG"],
    datasets: [
      {
        label: "My First dataset",
        fillColor: "rgba(59,89,182,0.6)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: [data.getValue(5,3),data.getValue(3,3),data.getValue(4,3),data.getValue(2,3),data.getValue(1,3)]
      }
      
    ]
  };

  window.onload = function(){
    window.myRadar = new Chart(document.getElementById("canvas").getContext("2d")).Radar(radarChartData, {
      responsive: true
    });

  }


       }

      function createUrl(hours, bib,limit){
          if (bib == 'all')
            bib = 'LSG%2CLST%2CLSW%2CLSN%2CLBS%2CFBC%2CFBW%2CFBP%2CFBI%2CFBM%2CFBA%2CBIB-N%2CFBH%2CTheaBib%2CLAF';
          var string = 'https://services.bibliothek.kit.edu/leitsystem/getdata.php?callback=jQuery110202885841310489923_1392937682274'+
                      '&location%5B0%5D='+bib+
                      '&values%5B0%5D=seatestimate%2Cmanualcount'+
                      '&after%5B0%5D=-'+3600*hours+'seconds'+
                      '&before%5B0%5D=now'+
                      '&limit%5B0%5D=-5000'+
                      '&location%5B1%5D=LSG%2CLST%2CLSW%2CLSN'+
                      '&values%5B1%5D=temperature'+
                      '&after%5B1%5D='+
                      '&before%5B1%5D=now'+
                      '&limit%5B1%5D=1'+
                      '&location%5B2%5D=LSG%2CLST%2CLSW%2CLSN%2CLBS%2CFBC%2CFBW%2CFBP%2CFBI%2CFBM%2CFBA%2CBIB-N%2CFBH%2CTheaBib%2CLAF'+
                      '&values%5B2%5D=location'+
                      '&after%5B2%5D='+
                      '&before%5B2%5D=now'+
                      '&limit%5B2%5D=1'+
                      '&_=1392937682275';
          return string;
       }

function createGraph(hours, bib) {
          
          var url = createUrl(hours,bib);
          if (bib== 'FBC' ||  bib== 'FBM' || bib== 'FBW' || bib== 'LAF') {
             $('#comment').text('Diese Bibliothek hat nur unregelmaessige Zaehlungen von Mitarbeitern als Datengrundlage')
            var cat = 'manualcount';
          }
          else {
            $('#comment').text('')
            var cat = 'seatestimate';
          }

          jQuery.ajax({
               url:url,
               dataType: 'jsonp', 
               success:function(json){
                  console.log(json);
                  var data = [['Time', 'belegte Sitze']];
                  var seats = json[0];

                  function getName(name) {
                    return $(json[2].location).attr(name)[0].long_name;
                  }

                  $($($(seats).attr(cat)).attr(bib)).each(function(){
                          console.log("slot: ",this);
                          var value = this.occupied_seats;
                          var time = timeConverter(this.timestamp.date);
                          var text = '<p>'+this.timestamp.date +' : '+value+'</p>';
                          data.push([time, value]);
                  })

                  drawChart(data,getName(bib));
               },
               error:function(){
                   alert("Sorry, there was an error receiving the data");
               },
          });
      }

      function timeConverter(date){
          var parts = date.split(' ');
          var part = parts[0].split('-');
           var year = part[0]
           var month = part[1]
           var day = part[2]
           var part = parts[1].split(':');
           var hour = part[0]
           var min =  part[1]
           return new Date(year, month-1, day, hour, min);

           //2014-02-21 01:02:18  YY
       }

      function drawChart(data,name) {
        var drawData = google.visualization.arrayToDataTable(data);



        var options = {
        
          //fontName: '"Source Sans Pro"',
          curveType: 'function',
          backgroundColor: '#efefef',
          crosshair: { trigger: 'both' },
          hAxis: {title: 'Letzte 36 Stunden',
                  titleTextStyle: {italic: false},
                  textStyle: { 
                           // fontName: 'Source Sans Pro', 
                            fontSize: '10' },
                   gridlines: {
                              color: '#79CDCD',
                              
                            }
                  },
          vAxis: {title: 'belegte Sitze',
                  titleTextStyle: {italic: false},
                  textStyle: {  
                           // fontName: 'Source Sans Pro', 
                            fontSize: '10' },
                 gridlines: {
                              color: '#79CDCD',
                            
                            }
                  },
          legend: 'none'
        };
        
       
          var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
        chart.draw(drawData, options);
      
      
      }

