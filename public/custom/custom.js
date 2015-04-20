window.onload = function() {

  // TODO: pass curUser from server to client
  //var curUser = {username : 'hohnerlein.christoph'};

  //  MAIN TABLE ======================================================

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
      url: '/items/',
      dataSrc: 'items'
    },

    // Extract each column value from a different object variable
    columns: [
      { data: 'Category' },
      { data: 'Item' },
      { data: 'Label' },
      { data: 'Location' },
      { data: 'Condition' },
      // Insert column full of checkout buttons that open the borrowModal
      { data: null,
        orderable: false,
        'defaultContent' : '<button class="btn btn-default checkoutButton" data-toggle="modal" data-target="#borrowModal">Check out</button>'}
    ],
    order: [[2, 'asc']] // Order by label
  });

  // Borrow modal fetches data from row it was opened from
  $('#borrowModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    data = itemTableList.row( button.parents('tr') ).data(); // Data of tr
    // data now contains an item object

    // Update the modal's content
    var modal = $(this);
    modal.find('#borrowType').text(data.Category);
    modal.find('#borrowTitle').text(data.Item);
    modal.find('#borrowLabel').text(data.Label);
  });

  // checkoutButton click event
  // TODO error handling
  $('#checkoutButton').click( function(){
    // POST the label to checkout API
    $.post(
      'items/checkout/'+$('#borrowLabel').text()
    ).done(function(response){
      // Close modal and reload table once done
      $('#borrowResponse').html(response);
      $('#borrowResponse').removeClass('has-error');
      $('#borrowResponse').addClass('has-success');

      // Close modal and reload main page
      window.setTimeout(function() { 
        $('#borrowModal').modal('hide');
        window.location.reload();
      }, 400);
    }).fail( function(xhr, textStatus, errorThrown) {
      $('#borrowResponse').removeClass('has-success');
      $('#borrowResponse').addClass('has-error');
      $('#borrowResponse').html(xhr.responseText);
    });
  });

  // returnButton click event
  // TODO error handling
  $('#returnButton').click( function(){
    // POST the label to return API
    $.post(
      'items/return/'+$('#returnItemForm').val()
    ).done( function( response ) {
      $('#returnResponse').html(response);
      $('#returnItemGroup').removeClass('has-error');
      $('#returnItemGroup').addClass('has-success');
    }).fail( function(xhr, textStatus, errorThrown) {
      $('#returnItemGroup').removeClass('has-success');
      $('#returnItemGroup').addClass('has-error');
      $('#returnResponse').html(xhr.responseText);
    });
  });

  // Add event listener for opening and closing details
  // TODO: select only row trs, to not try to expand details
  $('#itemTable > tbody').on('click', 'tr', function () {
    
    var tr = $(this);
    var row = itemTableList.row( tr );

    // Details are already open - close them, else open them
    if ( row.child.isShown() ) {
      
      row.child.hide();
      tr.removeClass('shown');
    }
    else {
      row.child( expandDetails(row.data()) ).show();
      tr.addClass('shown');
    }
  } );

  // Searchbar behaviour
  $('#searchBar').on( 'keyup', function (e) {

    var t = $(this);

    // Show clearer when no content
    t.next('span').toggle(Boolean(t.val()));

    // On esc we clear the searchbar, otherwise search
    if (e.keyCode == 27) {
      $('.clearer').click();
    } else {
      itemTableList.search( t.val() ).draw();
    }
  });

  // decide clearer visibility on pageload
  $(".clearer").hide($(this).prev('input').val());

  // clearer onClick: delete searchbar content,show all items, hide clearer
  $(".clearer").click(function () {
    $(this).prev('input').val('').focus();
    itemTableList.search('').draw();
    $(this).hide();
  });

  //  USER STUFF ======================================================

  // Focus username field on login modal open
  $('#loginModal').on('shown.bs.modal', function () {
    $('#loginIDForm').focus();
  });

  // Login handle
  $('#loginForm').submit(function(){
    // prevent default reload
    event.preventDefault();

    $.post('login',{
      username : $('#loginIDForm').val()
    }).done(function(){

      // Feedback on succesfull login
      $("#loginForm").addClass("has-success");
      $("#loginForm").removeClass("has-error");

      $(".loginFeedbackFail").fadeOut();
      $(".loginFeedbackSuccess").fadeIn();

      // Close modal and reload main page
      window.setTimeout(function() { 
        $('#loginModal').modal('hide');
        window.location.reload();
      }, 400);

    }).fail(function(){

      // Feedback on unsuccesfull login
      $("#loginForm").removeClass("has-success");
      $("#loginForm").addClass("has-error");
      $(".loginFeedbackSuccess").fadeOut();
      $(".loginFeedbackFail").fadeIn();
    });
  });


  // Initialize DataTable for user
  var userTableList = $('#borrowedTable').DataTable({
    // Data source: ajax call to /listItems, where 'items' object is passed
    ajax:  {
      url: '/checkUserItems',
      dataSrc: 'items'
    },
    paging: false,  // turn of paging
    // Extract each column value from a different object variable
    columns: [
      { data: 'Category' },
      { data: 'Item' },
      { data: 'Label' },
      { data: 'Location' },
      { data: 'Condition' }
    ],
    order: [[2, 'asc']], // Order by label
    columnDefs: [{
      targets: '_all',
      defaultContent: ''
    }] 
  });

  //  CSV STUFF ======================================================

  // TODO: redraw table, not reinitilise
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
  
  // Initialize sortable list for parsing
  $('.sortable').sortable();

  // Initialize default list order from sortable list
  var columOrder = $('#reorderList > li > button').contents();

  // When user stopped sorting, extract new order from sortable list
  $('.sortable').sortable().bind('sortupdate', function(e, ui) {
    columOrder = $('#reorderList > li > button').contents();
  });

  // Submit button for parsing
  $('#submitCSV').click(function(){
    var input = $('#csvInputField').val();

    // parse our data from the input field
    var results = Papa.parse(input, parseConfig);

    // myItems array that holds all items
    myItems = [];

    // Reorder items according to the sortable list
    results.data.forEach(function (itemElement, idx, array) {
      // temporary item
      var item = {};
      itemElement.forEach(function(element,idx,array){

        // if we have an sortable element for a value, save as key/value pair in item
        if ( idx < columOrder.length ){
          item[columOrder[idx].data] = itemElement[idx];
          //console.log('key: '+ columOrder[idx].data + ', value: '+ testdata[0][idx])
        } else {  // else, save as with an empty key
          item[''] = itemElement[idx];
        }
      });

      // Append the ordered item to our myItems array
      myItems.push(item);
    });

    // Initialize DataTable for parsed content
    var parsedTableList = $('#parsedTable').DataTable({
      paging: false,  // turn of paging
      // Extract each column value from a different object variable
      // this time capitalized, since they are extracted from the sortable list
      columns: [
        { data: 'Category' },
        { data: 'Item' },
        { data: 'Label' },
        { data: 'Location' },
        { data: 'Condition' }
      ],
      order: [[2, 'asc']], // Order by label
      columnDefs: [{
        targets: '_all',
        defaultContent: ''
      }] 
    });

    // Now we clear the table, add our rows and finally draw it
    parsedTableList.clear().rows.add(myItems).draw();

    // We only show results if we have some
    if(results.data !== 0){
      $('#parsedData').show();
    }
    else{
      $('#parsedData').hide();
    }
  });
  
  // Write CSV to db
  $('#writeCSV').click(function(){

    // Collect all rows of parsedTableList into one parsedDataArray
    parsedDataArray=[];
    parsedTableList.data().each(function(elem,key){
      parsedDataArray.push(elem);
    });

    // POST the stringified array of objects to createItemsBulk
    // contentType important for parsing
    $.ajax({
      url: 'items/createBulk',
      type: 'POST',
      data: JSON.stringify(parsedDataArray),
      processData: false,
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }).done(function() {
      window.location.replace('/');
    });
  });
};

// Formatting function for row details
function expandDetails( d ) {
  // `d` is the original data object for the row
  return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
    '<tr>'+
      '<td>Description:</td>'+
      '<td>'+d.Description+'</td>'+
      '<td>URL:</td>'+
      '<td>'+d.URL+'</td>'+
      '<td>Comment:</td>'+
      '<td>'+d.Comment+'</td>'+
    '</tr>'+
  '</table>';
}
