window.onload = function() {
  
  // Initialize DataTable items
  var itemTableList = $('#itemTable').DataTable({

    // DOM control of table:
    // l - length changing input control
    // f - filtering input (disabled)
    // t - The table!
    // i - Table information summary
    // p - pagination control
    // r - processing display element

    dom: 'lrtip',

    // Data source: ajax call to /listItems, where 'items' object is passed
    ajax:  {
      url: '/listItems',
      dataSrc: 'items'
    },

    // Extract each column value from a different object variable
    columns: [
      { data: 'category' },
      { data: 'name' },
      { data: 'label' },
      { data: 'location' },
      { data: 'condition' }
    ]
  });

  // Make navbar textfield filter the table
  $('#searchBar').on( 'keyup', function () {
    itemTableList.search( this.value ).draw();
  } );

  // initialize DataTable with parsed content
  var parsedTableList = $('#parsedTable').DataTable({
    paging: false,  // turn of paging
    columnDefs: [{
      targets: '_all',
      defaultContent: ''
    }] 
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
