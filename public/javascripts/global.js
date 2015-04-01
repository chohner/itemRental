window.onload = function() {
  
  // List.js - searchable, sortable and paginated table
  var options = {valueNames: [ 'category', 'name', 'labelID','location','condition'], plugins: [ListPagination({})]};
  var itemList = new List('search-results', options);

  

  // initialize DataTable with parsed content
  // turn of paging
   var parsedTableList = $('#parsedTable').DataTable({
    paging: false
   });

  // CSV STUFF

  // Parser Config
  var parseConfig = {
    delimiter: "",  // auto-detect
    newline: "",  // auto-detect
    header: false,
    dynamicTyping: false,
    preview: 0,
    encoding: "",
    worker: false,
    comments: false,
    step: undefined,
    complete: undefined,
    error: undefined,
    download: false,
    skipEmptyLines: false,
    chunk: undefined,
    fastMode: undefined
  };

  // Hide parsedData div on pageload since its empty
  $('#parsedData').hide();

  // Submit button for parsing
  $('#submitCSV').click(function(){
    var input = $('#csvInputField').val();

    // parse our data from the input field
    var results = Papa.parse(input, parseConfig);

    // assume following format:
    // Category; Item; Description; Label; SN (part of ID); Location; Status; Condition; Comment; URL

    // First we clear the table, add our rows and finally draw it
    parsedTableList.clear().rows.add(results.data).draw();

    // We only show results if we have some
    if(results.data != 0){
      $('#parsedData').show();
    }
    else{
      $('#parsedData').hide();
    };
  });
};
