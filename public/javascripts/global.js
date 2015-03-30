window.onload = function() {
  
  // List.js - searchable, sortable and paginated table
  var options = {valueNames: [ 'category', 'name', 'labelID','location','condition'], plugins: [ListPagination({})]};
  var itemList = new List('search-results', options);

  // CSV PARSING

  $('#submitCSV').click(function()
  {
    //var config = buildConfig();
    var input = $('#csvInputField').val();

    var results = Papa.parse(input);
    parsedData = results;

    jade.render(document.getElementById('parsedTable'), 'parsedTable', { items : parsedData.data });

    parsedData = results;
    console.log(results);
  });
  
  // status('Choose a .csv file');
  // // Check to see when a user has selected a file
  // var timerId;
  // timerId = setInterval(function() {
  //   if($('#libraryDataInput').val() !== '') {
  //     clearInterval(timerId);
  //     $('#uploadForm').submit();
  //   }
  // }, 500);

  // $('#uploadForm').submit(function() {
  //   status('uploading the file ...');
  //   $('#uploadForm').ajaxSubmit({ 
  //     error: function(xhr) {
  //       status('Error: ' + xhr.status);
  //     },
  //     success: function(response) {
  //       //TODO: We will fill this in later
  //     }
  //   });
  //   // Stop page refresh
  //   return false;
  // });

  // function status(message) {
  //   $('#uploadStatus').text(message);
  // }

};