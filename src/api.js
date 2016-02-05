export class API {
  loadData() {
    $.getJSON("http://127.0.0.1:5000/v1/payments/", function(data) {
      $('#payments-table tbody').empty();
      
      
      for (var elem of data.hits.hits) {
        var item = elem._source;
        var $tr = $('<tr></tr>');
        var attrs = ['name', 'zip_code', 'town', 'country', 'year', 'amount_euro'];
        for (var a of attrs) {
            var $td = $('<td></td>');
            $td.text(item[a]);
            $td.appendTo($tr);
        }
        $('#payments-table tbody').append($tr);
      }
    });
  }

}