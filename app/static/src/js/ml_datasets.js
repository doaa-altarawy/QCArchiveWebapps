
/* Formatting function for row details - modify as you need */
function format_details( data ) {
    // `data` is the original data object for the row

    var details = $('.ds_details_template').clone();
    details.removeClass('ds_details_template');

    details.find('.description').append(data.description);
    details.find('.elements')
           .append(format_elements(data.elements, null, null, null, true));

    citations = '<ul>';
    for (var i in data.citations){
        citations += '<li>' + data.citations[i].acs_citation;

        if (data.citations[i].url)
            citations += ' <a target="_blank" href="' + data.citations[i].url + '">'
                + data.citations[i].url + '</a>';

        citations+= '</li>';
    }
    citations += '</ul>';
    details.find('.citations').append(citations);

    labels = '';
    for (var key in data.labels){
         labels += '<span class="badge badge-success mr-1">'+ data.labels[key] + '</span>';
    }
    details.find('.labels').append(labels);

    tags = '';
    for (var key in data.tags){
         tags += '<span class="badge badge-warning mr-1">'+ data.tags[key] + '</span>';
    }
    details.find('.tags').append(tags);

    return details;
}

function format_buttons(data, type, row, meta){

    var buttons = $('.download_template').clone();
    buttons.removeClass('download_template');

    if (!data.view_url_hdf5) {
        buttons.find('#hdf5').remove();
    }
    else {
        buttons.find('#hdf5').attr('href', data.view_url_hdf5);
    }

    if (!data.view_url_plaintext) {
        buttons.find('#text').remove();
    }
    else {
        buttons.find('#text').attr('href', data.view_url_plaintext);
    }

    return buttons.html();
}

function format_elements(data, type, row, meta, full){

    out = '';
    for (var i in data){
        if (!full & i == 5){
            out += ' ...';
            break;
        }

        var ele = '';
        if (window.jmol_colors){
            var style = 'style="background-color: ' + window.jmol_colors[data[i]] +'"';
            ele = '<span class="badge mr-1"'
                  + style + '>'
                  + data[i] + '</span>';
        } else {
            if (i > 0)
                ele += ', ';
            ele += data[i];
        }
        out += ele;
    }

    return out;
}

$(document).ready( function () {

    $.ajax({
        url: '/static/jmol_colors.json',
        async: false,
    }).done(function (data) {
        window.jmol_colors = data;
    });

    console.log('Creating datatable');
    var table = $('#ds_table').DataTable({

        dom: 'f <"toolbar"> r <t> i p',  // 'f l r <t> i p'
        searching: true,
        pageLength: 12,
        ordering:  true,
        paging: true,
        order: [[1, 'asc']], // column #1
        //compact: true,  // styles classes not here

        "ajax": "/ml_datasets_list/",

        "columns": [
            {   // expand button
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": '',
            },
            { title: "Name" , data: "name" },
            { title: "Quality", data: "theory_level" },
            { title: "Data Points", data: "data_points", className: "numeric" },
            { title: "Elements", data: "elements", render: format_elements, className: "elements-cell"},
            { title: "Sampling", data: "sampling" },
            {
                "title": "Download",
                "targets": -1,  // first col from right
                "data": null,   //pass the whole row to the render function
                "orderable": false,
                "className": "btns-cell",
                "render": format_buttons,
            }
        ],


        // dom: 'Bfrtip',
        // buttons: [
        //     'copy', 'excel', 'pdf'
        // ]

    });

    $("div.toolbar").append(
          '<a id="add_your_ds" href="#">Add your Dataset</a>'
        + '<a id="license" href="#">License</a>'
    );


    function log_download(ds_name, type){
         $.ajax({
            url: '/log_access/download',
            data: {
                dataset_name: ds_name,
                download_type: type
            }
        }).done(function (ret) {
            // console.log('logging download: ', ret);
        });
    }

    $('#ds_table tbody').on( 'click', 'a#hdf5', function (e) {
        var data = table.row( $(this).parents('tr') ).data();

        log_download(data.name, 'hdf5');
    } );

    $('#ds_table tbody').on( 'click', 'a#text', function (e) {
        var data = table.row( $(this).parents('tr') ).data();
        log_download(data.name, 'text');
    } );


    // Add event listener for opening and closing details
    $('#ds_table tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            tr.removeClass('light-gray-bg');
        }
        else {
            // Open this row
            row.child( format_details(row.data())  ).show();
            row.child().addClass('light-gray-bg');
            tr.addClass('light-gray-bg');
            tr.addClass('shown');

        }
    } );

    $('#dialog-message').dialog({
        autoOpen: false,
        modal: true,
        width: '40%',
        position: {
          at: "center top",
        },
        buttons: {
          Ok: function() {
            $( this ).dialog( "close" );
          }
        }
    });

    $('#add_your_ds').click(function (e) {
        e.preventDefault();

        var msg = "To add your Machine Learning Dataset, please "
                  + "email us at <a class='card-link' href='mailto:qcarchive@molssi.org'>qcarchive@molssi.org</a>.";

        $('#dialog-message #msg').html(msg);
        $('#dialog-message').dialog( "open" );
    });

    $('#license').click(function (e) {
        e.preventDefault();

        var msg = "All datasets are provided under the "
                  + "<a class='card-link' target='_blank' href='https://creativecommons.org/licenses/by/4.0/legalcode'>"
                  + "Creative Commons 4.0 Attribution </a> license.";

        $('#dialog-message #msg').html(msg);
        $('#dialog-message').dialog( "open" );

    });

} );


