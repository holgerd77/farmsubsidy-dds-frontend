var API_URL =  'http://localhost:5000/v1/'
var PAYMENTS_ENDPOINT = 'payments/'

var YEARS_DEFAULT_VALUES = [
  ['All', null],
  ['2014', '2014']
]

var AMOUNT_DEFAULT_VALUES = [
  ['All', null],
  ['> 1.000.000 €', '1000000'],
  ['> 100.000 €', '100000'],
  ['> 10.000 €', '10000'],
  ['> 1.000 €', '1000']
]

var API = (function(API, $, undefined) {
  
  API.params = {
    'rows': 30,
    'q': null,
    'year': null,
    'amount_euro_gte': null,
    'town': null,
    'sub_payments_type': null
  }
  
  API.aggs2sb = function(aggs) {
    sb_list = [['All', null]];
    for (var i=0; i<aggs.length; i++) {
      sb_list.push([aggs[i]['key'], aggs[i]['key']]);
    }
    return sb_list;
  }
  
  API.createSearchBox = function(id, param, title, v_list) {
    $('#'+id).empty();
    var $ul = $('<ul class="list-unstyled snb-items"></ul>');
    for (var i=0; i<v_list.length; i++) {
      var display = v_list[i][0];
      var value = v_list[i][1];
      var $a = $('<a href="#"></a>');
      if (value === API.params[param]) {
        $a.addClass('sn-active');
      }
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
    
    $('#'+id).append($snb);
  };
  
  API.loadData = function() {
    $.ajax({
      url: API_URL + PAYMENTS_ENDPOINT,
      method: 'GET',
      cache: false,
      dataType: 'json',
      data: this.params
    })
    .success(function(data) {
      $('#payments-table tbody').empty();
      
      for (var elem of data.hits.hits) {
        var item = elem._source;
        var $tr = $('<tr></tr>');
        var attrs = ['name', 'zip_code', 'town', 'country', 'year', 'amount_euro'];
        for (var a of attrs) {
            var $td = $('<td></td>');
            if (a == 'amount_euro') {
              $td.addClass('text-xs-right');
            }
            $td.text(item[a]);
            $td.appendTo($tr);
        }
        $('#payments-table tbody').append($tr);
      }
      
      API.createSearchBox('search-nav-box-towns', 'town', 'Towns', API.aggs2sb(data.aggregations.Towns.buckets));
      API.createSearchBox('search-nav-box-sub-payments-type', 'sub_payments_type', 'Sub Payments Type', API.aggs2sb(data.aggregations["Sub Payments Type"].buckets));
    });
  };
  
  return API;

}(API || {}, jQuery));
