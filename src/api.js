var API_URL =  'http://127.0.0.1:5000/v1/'
var PAYMENTS_ENDPOINT = 'payments/'

var AMOUNT_DEFAULT_VALUES = [
  ['All', ''],
  ['> 1.000.000 €', '1000000'],
  ['> 100.000 €', '100000'],
  ['> 10.000 €', '10000'],
  ['> 1.000 €', '1000']
]

var API = (function(API, $, undefined) {
  
  API.params = {
    'q': null,
    'amount_euro_gte': ''
  }
  
  API.createSearchBox = function(id, param, title, v_list) {
    $('#'+id).empty();
    var $ul = $('<ul class="list-unstyled snb-items"></ul>');
    for (var i=0; i<v_list.length; i++) {
      var display = v_list[i][0];
      var value = v_list[i][1];
      var $a = $('<a href="#"></a>');
      $a.text(display);
      $a.data('value', value);
      
      $a.click(function(e) {
        API.params[param] = $(this).data('value');
        API.createSearchBox(id, param, title, v_list);
        API.loadData();
        e.preventDefault();
      })
      
      var $li = $('<li></li>');
      $a.appendTo($li);
      $li.appendTo($ul);
    }
    var $sh = $('<div class="snb-head"></di>');
    $sh.text(title);
    
    var $snb = $('<div class="search-nav-box"></div>');
    $sh.appendTo($snb);
    $ul.appendTo($snb);
    
    /*
    <div class="search-nav-box">
      <div class="snb-head">Amount</div>
      
        <li class="sn-active">All</li>
        <li>&gt; 1.000.000 €</li>
        <li>&gt; 100.000 €</li>
        <li>&gt; 10.000 €</li>
        <li>&gt; 1.000 €</li>
    </div>*/
    $('#'+id).append($snb);
  };
  
  API.loadData = function() {
    $.getJSON(API_URL + PAYMENTS_ENDPOINT, this.params, function(data) {
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
  };
  
  return API;

}(API || {}, jQuery));


$(document).ready(function() {
  API.createSearchBox('search-nav-box-amount', 'amount_euro_gte', 'Amount', AMOUNT_DEFAULT_VALUES);
  API.loadData();

  $('#search-btn').click(function(e) {
    API.params['q'] = $('#search-input').val();
    API.loadData();
  })
});