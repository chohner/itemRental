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
    ],
    order: [[2, 'asc']] // Order by label
  });

  // Add event listener for opening and closing details
  $('#itemTable tbody ').on('click', 'tr', function () {
    
    var tr = $(this);
    var row = itemTableList.row( tr );

    if ( row.child.isShown() ) {
      // This row is already open - close it
      row.child.hide();
      tr.removeClass('shown');
    }
    else {
      // Open this row
      row.child( format(row.data()) ).show();
      tr.addClass('shown');
    }
  } );

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

// Formatting function for row details
function format ( d ) {
  // `d` is the original data object for the row
  return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
    '<tr>'+
      '<td>Description:</td>'+
      '<td>'+d.description+'</td>'+
      '<td>URL:</td>'+
      '<td>'+d.url+'</td>'+
      '<td>Comment:</td>'+
      '<td>'+d.comment+'</td>'+
    '</tr>'+
  '</table>';
}
