if (window.location.hostname == '127.0.0.1' || window.location.hostname == 'localhost') {
  var API_URL =  'http://127.0.0.1:5000/v1/'
} else {
  var API_URL =  'https://api.openfarmsubsidies.org/v1/'
}
var PAYMENTS_ENDPOINT = 'payments/'
var COUNTRIES_ENDPOINT = 'countries/'

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
  
  API.countries = {}
  
  API.params = {
    'rows': 30,
    'q': null,
    'year': null,
    'amount_euro_gte': null,
    'country': null,
    'town': null,
    'sub_payments_type': null
  }
  
  API.formatCurrency = function(val) {
    val = parseFloat(val);
    var n = 2, x = 3, s = ',', c = '.';
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = val.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
  }
  
  API.createCountrySelBox = function() {
    $.each(API.countries, function(k, v) {
      $o = $('<option></option>');
      $o.attr('value', k);
      $o.text(v.name);
      $('#country-select').append($o);
    });
    $('#country-select').change(function() {
      API.params['country'] = $('#country-select option:selected').attr('value');
      API.loadData();
      e.preventDefault();
    });
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
        var c = API.countries[item['country']];
        
        var $td = $('<td></td>');
        
        var $elem = $('<span>' + item['name'] + '</span>');
        $elem.attr('data-toggle', 'popover');
        $elem.attr('data-placement', 'top');
        $elem.attr('data-title', 'Translation (en)');
        
        if (item['name_en']) {
          var content = '<p>' + item['name_en'] + '</p>';
          content += '<p style="font-size:0.6rem;">';
          content += '<a href="http://translate.yandex.com/" target="_blank">Powered by Yandex.Translate</a>';
          content += '</p>';
          
        } else {
          var content = 'No translation available';
        }
        $elem.attr('data-content', content);
        $elem.appendTo($td);
        $td.appendTo($tr);
        
        $td = $('<td class="text-xs-center"></td>');
        var html ='<a href="' + c.data_url + '" target="_blank" ';
        html += 'data-toggle="tooltip" data-placement="top">';
        html += '<i class="fa fa-external-link"></i></a>';
        $a = $(html);
        $a.attr('title', "Source: " + c.agency_name);
        $a.appendTo($td);
        $td.appendTo($tr);
        
        $td = $('<td></td>');
        $td.addClass('hidden-md-down');
        $td.addClass('text-xs-center');
        $td.text(item['zip_code']);
        $td.appendTo($tr);
        
        $td = $('<td></td>');
        $td.addClass('hidden-md-down');
        $td.text(item['town']);
        $td.appendTo($tr);
        
        $td = $('<td></td>');
        $td.addClass('text-xs-center');
        $td.html('<span class="flag-icon flag-icon-' + item['country'].toLowerCase() + '"></span>');
        $td.appendTo($tr);
        
        $td = $('<td></td>');
        $td.addClass('hidden-md-down text-xs-right');
        var sps = item['sub_payments_euro'];
        var $elem = $('<span class="label label-pill label-default">' + sps.length + '</span>');
        if (c.nc_symbol != '') {
          $elem.attr('data-toggle', 'popover');
          $elem.attr('data-placement', 'top');
          $elem.attr('data-title', 'Sub Payments');
          if (sps.length > 0) {
            var content = '<table class="table">'
            $.each(sps, function(index, sp) {
              content += '<tr>';
              content += '<td>' + $('<p>' + sp.name + '</p>').text() + '</td>';
              content += '<td class="text-xs-right">';
              content += '<span style="white-space: nowrap;';
              if (c.nc_symbol != '') {
                content += 'color:rgb(80, 128, 193);font-style:italic;';
              }
              content += '">' + API.formatCurrency(sp.amount) + ' €</span>';
              content += '</td>';
              content += '</tr>';
            });
            content += '</table>';
          } else {
            var content = 'No information on sub payments available.';
          }
          $elem.attr('data-content', content);
        }
        $elem.appendTo($td);
        $td.appendTo($tr);
        
        $td = $('<td></td>');
        $td.addClass('text-xs-center');
        $td.text(item['year']);
        $td.appendTo($tr);
        
        $td = $('<td></td>');
        $td.addClass('text-xs-right');
        var $elem = $('<span></span>');
        $elem.html('<nobr>' + API.formatCurrency(item['amount_euro']) + ' €</nobr>');
        if (c.nc_symbol != '') {
          $elem.attr('data-toggle', 'popover');
          $elem.attr('data-placement', 'top');
          $elem.attr('data-title', 'Estimated Euro value');
          var content = '<table class="table">'
          content += '<tr><td>Original amount</td><td class="text-xs-right"><b>' + API.formatCurrency(item['amount_nc']) + ' ' + c.nc_sign + '</b></td></tr>';
          content += '<tr><td>Conversion rate</td><td class="text-xs-right">' + item['nc_conv_rate'] + '</td></tr>';
          content += '<tr><td>Date</td><td class="text-xs-right">' + item['nc_conv_date'] + '</td></tr>';
          content += '<tr><td>Source</td><td class="text-xs-right">Fixer.io API</td></tr>';
          content += '</table>';
          $elem.attr('data-content', content);
          $td.addClass('derived-amount');
        }
        $elem.appendTo($td);
        $td.appendTo($tr);
        
        $td = $('<td></td>');
        var $actionDD = $('<div class="btn-group"></div>');
        var $btn = $('<button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-toggle="dropdown"><i class="fa fa-search"></i></button>');
        $btn.appendTo($actionDD);
        var $menu = $('<div class="dropdown-menu dropdown-menu-right"></div>');
        
        var action = '<a href="http://www.google.com?#q=' + encodeURIComponent(item['name']) + '" target="_blank"';
        action += 'style="font-size: 0.9rem;" class="dropdown-item">Google</a>';
        $(action).appendTo($menu);
        
        if (item['name_en']) {
          var action = '<a href="http://www.google.com?#q=' + encodeURIComponent(item['name_en']) + '" target="_blank"';
          action += 'style="font-size: 0.9rem;" class="dropdown-item">Google (en)</a>';
          $(action).appendTo($menu);
        }
        
        var action = '<a href="https://opencorporates.com/companies?jurisdiction_code=&q=' + encodeURIComponent(item['name']) + '" target="_blank"';
        action += 'style="font-size: 0.9rem;" class="dropdown-item">OpenCorporates</a>';
        $(action).appendTo($menu);
        
        if (item['name_en']) {
          var action = '<a href="https://opencorporates.com/companies?jurisdiction_code=&q=' + encodeURIComponent(item['name_en']) + '" target="_blank"';
          action += 'style="font-size: 0.9rem;" class="dropdown-item">OpenCorporates (en)</a>';
          $(action).appendTo($menu);
        }
        
        $menu.appendTo($actionDD);
        $actionDD.appendTo($td);
        $td.appendTo($tr);
        
        $('#payments-table tbody').append($tr);
      }
      
      API.createSearchBox('search-nav-box-towns', 'town', 'Towns', API.aggs2sb(data.aggregations.Towns.buckets));
      API.createSearchBox('search-nav-box-sub-payments-type', 'sub_payments_type', 'Sub Payments Type', API.aggs2sb(data.aggregations["Sub Payments Type"].buckets));
    });
  };
  
  API.init = function() {
    $('body').tooltip({
      selector: '[data-toggle="tooltip"]'
    });
    $('body').popover({
      selector: '[data-toggle="popover"]',
      html: true,
      trigger: 'hover'
    })
    
    API.createCountrySelBox();
    API.createSearchBox('search-nav-box-years', 'year', 'Years', YEARS_DEFAULT_VALUES);
    API.createSearchBox('search-nav-box-amount', 'amount_euro_gte', 'Amount', AMOUNT_DEFAULT_VALUES);
    API.loadData();

    $('#search-btn').click(function(e) {
      API.params['q'] = $('#search-input').val();
      API.loadData();
    })
  }
  
  return API;

}(API || {}, jQuery));
