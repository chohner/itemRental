window.onload = function() {

  //  MAIN TABLE ======================================================

  var itemTableList = $('#itemTable').DataTable({

    // DOM control of table:
    // l - length changing input control (disabled)
    // f - filtering input (disabled, uses global searchfield)
    // t - The table itself
    // i - Table information summary
    // p - pagination control
    // r - processing display element

    dom: 'rtip',

    // Data source: ajax call to /listItems, where 'items' object is passed
    ajax:  {
      url: '/items/',
      dataSrc: 'items'
    },

    // Extract each column value from a different object variable
    columns: [
      { className: "expandDetails", data: 'Category' },
      { className: "expandDetails", data: 'Item' },
      { className: "expandDetails", data: 'Label' },
      { className: "expandDetails", data: 'Location' },
      { className: "expandDetails", data: 'Condition' },
      { data: 'UserId'}
    ],
    // on the last column, we want to either show a checkout button or display a disabled out button with a tooltip showing the owner
    columnDefs: [ {
      targets: 5,
      createdCell: function (td,cellData,rowData,row,col) {
        $//(td).addClass('noDetail')
        if (cellData == null ){
          $(td).html('<button class="btn btn-default checkoutButton btn-success btn-block" data-toggle="modal" data-target="#borrowModal">Check out</button>');
        } else {
          $.get( 'items/'+ rowData.Label +'/owner', function(data){
            $(td).html('<div  data-toggle="tooltip" data-placement="top" title="Item borrowed by: '+data.firstname+' '+ data.lastname+'"><button type="button" class="btn btn-default btn-warning btn-block" disabled="disabled">Out</button></div>')
            $('[data-toggle="tooltip"]').tooltip();
          });
        }
      }
    }],
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

  // Add event listener for opening and closing details
  // TODO: select only row trs, to not try to expand details
  $('#itemTable > tbody').on('click', '.expandDetails', function () {
    var tr = $(this).closest('tr');
    var row = itemTableList.row( tr );

    // Details are already open - close them, else open them
    if ( row.child.isShown() ) {
      
      row.child.hide();
      tr.removeClass('shown');
    }
    else {

      var rowDetails = expandDetails(row.data());

      if (rowDetails !== '') {
        row.child( rowDetails ).show();
        tr.addClass('shown');
      }
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

  // Don't alert table errors (such as fetching items for user that is not logged-in)
  // They appear in the JS console instead
  $.fn.dataTable.ext.errMode = 'throw';

  //  USER STUFF ======================================================
  //  TODO this probably should be hidden from non-users

  // checkoutButton click event
  $('#checkoutButton').click( function(){
    // POST the label to checkout API
    $.post(
      'items/checkout/'+$('#borrowLabel').text()
    ).done(function(response){
      // Close modal and reload table once done
      $('#borrowResponse').html(response);
      $('#borrowResponse').addClass('alert-success');

      // Close modal and reload main page
      window.setTimeout(function() { 
        $('#borrowModal').modal('hide');
        itemTableList.ajax.reload();
      }, 800);
    }).fail( function(xhr, textStatus, errorThrown) {
      $('#borrowResponse').html(xhr.responseText);
      $('#borrowResponse').addClass('alert-danger');
      $('#borrowResponse').append(' Want to <a data-toggle="modal", href="#", data-target="#loginModal", style="color: white; text-decoration: underline;")> log in</a>?')
    });
  });

    // Reset #borrowModal on close
  $('#borrowModal').on('hidden.bs.modal', function (event) {
    $('#borrowResponse').removeClass('alert-danger');
    $('#borrowResponse').removeClass('alert-success');
    $('#borrowResponse').html('');
  });

  // Initialize DataTable for borrowed items
  var userTableList = $('#borrowedTable').DataTable({
    // Data source: ajax call to /users/checkItems, where 'items' object is passed
    dom: 'lrt',
    ajax:  {
      url: '/users/checkItems',
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

  //  ADMIN STUFF ======================================================
  //  TODO this probably should be hidden from non-admins

  // returnButton click event
  // TODO: redraw table (worst case: reload)
  $('#returnButton').click( function(){
    // POST the label to return API
    $.post(
      'items/return/'+$('#returnItemForm').val()
    ).done( function( response ) {
      $('#returnResponse').html(response);
      $('#returnItemGroup').removeClass('has-error');
      $('#returnItemGroup').addClass('has-success');
      itemTableList.ajax.reload();
    }).fail( function(xhr, textStatus, errorThrown) {
      $('#returnItemGroup').removeClass('has-success');
      $('#returnItemGroup').addClass('has-error');
      $('#returnResponse').html(xhr.responseText);
    });
  });

  // Initialize DataTable for user list
  var userTableList = $('#userListTable').DataTable({
    // Data source: ajax call to /users/checkItems, where 'items' object is passed
    dom: 'flrt',
    ajax:  {
      url: '/users/',
      dataSrc: 'users'
    },
    paging: false,  // turn of paging
    // Extract each column value from a different object variable
    columns: [
      { data: 'username' },
      { data: 'firstname' },
      { data: 'lastname' },
      { data: 'email' },
      { data: 'role' },
      { data: 'active' }
    ],
    order: [[4, 'asc'], [0, 'asc']], // Order by role, then by username
    columnDefs: [{
      targets: '_all',
      defaultContent: ''
    }] 
  });

  // addUserButton click event
  $('#addUserButton').click( function(e){
    e.preventDefault();
    // POST the user to users API
    $.post(
      'users',
      {
        username: $('#newUsername').val(),
        firstname: $('#newFirstname').val(),
        lastname: $('#newLastname').val(),
        email: $('#newEmail').val(),
        role: $('#newRole').val(),
        active: $('#newActive').val()
      }
    ).done(function(response){
      // Close modal and reload table once done
      // $('#borrowResponse').html(response);
      // $('#borrowResponse').addClass('alert-success');

      // Close modal and reload main page
      // window.setTimeout(function() { 
      //   $('#borrowModal').modal('hide');
      //   window.location.reload();
      // }, 800);
    }).fail( function(xhr, textStatus, errorThrown) {
      // $('#borrowResponse').html(xhr.responseText);
      // $('#borrowResponse').addClass('alert-danger');
    });
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
        } else {  // else, save as with an empty key
          item[''] = itemElement[idx];
        }
      });

      // Append the ordered item to our myItems array
      myItems.push(item);
    });

    if(typeof parsedTableList == 'undefined') {

      // FIXME parsedTableList probably shouldn't be global
      // Initialize DataTable for parsed content
      parsedTableList = $('#parsedTable').DataTable({
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
    }

    // If we have some results:
    if(results.data[0]){
      
      // Clear the table, add parsed content and draw it
      parsedTableList.clear().rows.add(myItems).draw();
      $('#parsedData').show();
    }
    else{
      parsedTableList.clear().draw();
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

  $('#startTour').click(function(){
    introJs().setOption('showStepNumbers', 'false').start();
  });
};

// Formatting function for row details
function expandDetails( d ) {
  // `d` is the original data object for the row

  // this is pretty ugly
  var resp = '';

  if (d.Description == '' && d.URL == null && d.Comment == null) {
    return resp;
  }

  if (d.Description !== '') {
    resp = resp + '<td class="col-xs-5">Description: '+d.Description+'</td>';
  } else {
    resp = resp + '<td class="col-xs-5"></td>';
  }

  if (d.URL !== null) {
    resp = resp + '<td class="col-xs-1"><a href="http://'+d.URL+'" target="_blank">More Information</a></td>';
  } else {
    resp = resp + '<td class="col-xs-1"></td>';
  }

  if (d.Comment !== null) {
    resp = resp + '<td class="col-xs-3">Comment: ' + d.Comment + '</td>';
  } else {
    resp = resp + '<td class="col-xs-3"></td>';
  }

  if (resp !== '') {
    resp = '<table class="table table-condensed"><tr>' + resp + '</tr></table>';
  }

  return resp;
}
