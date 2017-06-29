if (window.location.hostname == '127.0.0.1' || window.location.hostname == 'localhost') {
  //var API_URL =  'http://127.0.0.1:5000/v1/'
  var API_URL =  'https://api.openfarmsubsidies.org/v1/'
} else {
  var API_URL =  'https://api.openfarmsubsidies.org/v1/'
}
var PAYMENTS_ENDPOINT = 'payments/'
var COUNTRIES_ENDPOINT = 'countries/'

var CURRENT_PAGE = 1
var ITEMS_PER_PAGE = 30

var YEARS_DEFAULT_VALUES = [
  ['All', null],
  ['2016', '2016']
]

var AMOUNT_DEFAULT_VALUES = [
  ['All', null],
  ['> 1.000.000 €', '1000000'],
  ['> 100.000 €', '100000'],
  ['> 10.000 €', '10000'],
  ['> 1.000 €', '1000']
]


var USER_MSGS = {
  'LOADING'           : "Loading, please wait...", 
  'NO_DATA'           : "No subsidies found for this filter selection.",
  'API_NOT_AVAILABLE' : "Error loading the data, please try again later."
}

var API = (function(API, $, undefined) {
  
  API.countries = {}
  
  API.params = {
    'rows': ITEMS_PER_PAGE,
    'start': 0,
    'q': null,
    'year': null,
    'amount_euro_gte': null,
    'country': null,
    'town': null,
    'sub_payments_type': null
  }
  
  API.getUrlParameter = function(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
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
      CURRENT_PAGE = 1;
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
    var $ul = $('<ul class="list-unstyled snb-items collapse show" id="sb-choices-' + id + '"></ul>');
    var displayActive = '';
    for (var i=0; i<v_list.length; i++) {
      var display = v_list[i][0];
      var value = v_list[i][1];
      var $a = $('<a href="#"></a>');
      if (value === API.params[param]) {
        $a.addClass('sn-active');
        displayActive = display;
      }
      $a.text(display);
      $a.data('value', value);
      
      $a.click(function(e) {
        API.params[param] = $(this).data('value');
        API.createSearchBox(id, param, title, v_list);
        CURRENT_PAGE = 1;
        API.loadData();
        e.preventDefault();
      })
      
      var $li = $('<li></li>');
      $a.appendTo($li);
      $li.appendTo($ul);
    }
    var $sh = $('<div class="snb-head"></div>');
    var titleHTML = '<a data-toggle="collapse" href="#sb-choices-' + id + '" aria-expanded="true">';
    titleHTML += title + '<span class="hidden-sm-up">: <span class="snb-head-selected">' + displayActive + '</span></span><span style="float:right;"><i class="fa fa-caret-down"></i></span></a>';
    $sh.html(titleHTML);
    
    var $snb = $('<div class="search-nav-box"></div>');
    $sh.appendTo($snb);
    $ul.appendTo($snb);
    
    $('#'+id).append($snb);
  };
  
  API.showAPIMsg = function(msg) {
    $('#payments-table tbody').empty();
    var $tr = $('<tr></tr>');
    var $td = $('<td colspan="9" style="height:240px;vertical-align:middle;">' + msg + '</td>');
    $td.addClass('text-center');
    $td.appendTo($tr);
    $('#payments-table tbody').append($tr);
  };
  
  API.getSPSDisplayElem = function(item) {
    var c = API.countries[item['country']];
    var sps = item['sub_payments_euro'];
    
    if (sps) {
      var $elem = $('<span class="badge badge-pill badge-default">' + sps.length + '</span>');
      $elem.attr('data-toggle', 'popover');
      $elem.attr('data-placement', 'top');
      $elem.attr('data-title', 'Sub Payments');
      if (sps.length > 0) {
        var content = '<table class="table">'
        $.each(sps, function(index, sp) {
          content += '<tr>';
          content += '<td>' + $('<p>' + sp.name + '</p>').text() + '</td>';
          content += '<td class="text-right">';
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
    } else {
      var $elem = $('');
    }
    return $elem;
  };
  
  API.getAmountDisplayElem = function(item) {
    var c = API.countries[item['country']];
    
    var $elem = $('<span></span>');
    $elem.html('<nobr>' + API.formatCurrency(item['amount_euro']) + ' €</nobr>');
    if (c.nc_symbol != '') {
      $elem.attr('data-toggle', 'popover');
      $elem.attr('data-placement', 'top');
      $elem.attr('data-title', 'Estimated Euro value');
      var content = '<table class="table">'
      content += '<tr><td>Original amount</td><td class="text-right"><b>' + API.formatCurrency(item['amount_nc']) + ' ' + c.nc_sign + '</b></td></tr>';
      content += '<tr><td>Conversion rate</td><td class="text-right">' + item['nc_conv_rate'] + '</td></tr>';
      content += '<tr><td>Date</td><td class="text-right">' + item['nc_conv_date'] + '</td></tr>';
      content += '<tr><td>Source</td><td class="text-right">Fixer.io API</td></tr>';
      content += '</table>';
      $elem.attr('data-content', content);
    }
    return $elem;
  };
  
  API.getActionDDDisplayElem = function(item) {
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
    $('<div class="dropdown-divider"></div>').appendTo($menu);
    
    var action = '<a href="https://opencorporates.com/companies?jurisdiction_code=&q=' + encodeURIComponent(item['name']) + '" target="_blank"';
    action += 'style="font-size: 0.9rem;" class="dropdown-item">OpenCorporates</a>';
    $(action).appendTo($menu);
    
    if (item['name_en']) {
      var action = '<a href="https://opencorporates.com/companies?jurisdiction_code=&q=' + encodeURIComponent(item['name_en']) + '" target="_blank"';
      action += 'style="font-size: 0.9rem;" class="dropdown-item">OpenCorporates (en)</a>';
      $(action).appendTo($menu);
    }
    $('<div class="dropdown-divider"></div>').appendTo($menu);
    
    var location = '';
    if (item['zip_code']) {
      location += item['zip_code'] + ' ';
    }
    if (item['town']) {
      location += item['town'] + ' ';
    }
    if (item['region']) {
      location += ', ' + item['region'];
    }
    
    var action = '<a href="http://maps.google.com/?q=' + encodeURIComponent(location) + '" target="_blank"';
    action += 'style="font-size: 0.9rem;" class="dropdown-item">Google Maps</a>';
    $(action).appendTo($menu);
    
    var action = '<a href="https://www.openstreetmap.org/search?query=' + encodeURIComponent(location) + '" target="_blank"';
    action += 'style="font-size: 0.9rem;" class="dropdown-item">OpenStreetMap</a>';
    $(action).appendTo($menu);
    
    $menu.appendTo($actionDD);
    return $actionDD;
  }
  
  API.displaySearchResults = function(data) {
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
      
      $td = $('<td class="text-center"></td>');
      var html ='<a href="' + c.data_url + '" target="_blank" ';
      html += 'data-toggle="tooltip" data-placement="top">';
      html += '<i class="fa fa-external-link"></i></a>';
      $a = $(html);
      $a.attr('title', "Source: " + c.agency_name);
      $a.appendTo($td);
      $td.appendTo($tr);
      
      $td = $('<td></td>');
      $td.addClass('hidden-md-down');
      $td.addClass('text-center');
      $td.text(item['zip_code']);
      $td.appendTo($tr);
      
      $td = $('<td></td>');
      $td.addClass('hidden-md-down');
      $td.text(item['town']);
      $td.appendTo($tr);
      
      $td = $('<td></td>');
      $td.addClass('text-center');
      var $html = '<span data-toggle="tooltip" data-placement="top" ';
      $html += 'title="' + c.name + '" class="flag-icon flag-icon-' + item['country'].toLowerCase() + '"></span>';
      $td.html($html);
      $td.appendTo($tr);
      
      $td = $('<td></td>');
      $td.addClass('hidden-md-down text-right');
      
      var $elem = API.getSPSDisplayElem(item);
      
      $elem.appendTo($td);
      $td.appendTo($tr);
      
      $td = $('<td></td>');
      $td.addClass('text-center');
      $td.text(item['year']);
      $td.appendTo($tr);
      
      $td = $('<td></td>');
      $td.addClass('text-right');
      var $elem = API.getAmountDisplayElem(item);
      if (c.nc_symbol != '') {
        $td.addClass('derived-amount');
      }
      $elem.appendTo($td);
      $td.appendTo($tr);
      
      $td = $('<td></td>');
      var $actionDD = API.getActionDDDisplayElem(item);
      $actionDD.appendTo($td);
      $td.appendTo($tr);
      
      $('#payments-table tbody').append($tr);
    }
    
    API.createSearchBox('search-nav-box-towns', 'town', 'Towns', API.aggs2sb(data.aggregations.Towns.buckets));
    API.createSearchBox('search-nav-box-sub-payments-type', 'sub_payments_type', 'Sub Payments Type', API.aggs2sb(data.aggregations["Sub Payments Type"].buckets));
    
    if ($('.hidden-sm-up').is(':visible')) {
        $('.snb-items').removeClass('show');
    }
  }
  
  API.updatePaginationDisplay = function(numResults) {
    if (CURRENT_PAGE == 1) {
      $('#p_backward').addClass('disabled');
    } else {
      $('#p_backward').removeClass('disabled');
    }
    if (numResults > CURRENT_PAGE * ITEMS_PER_PAGE) {
      $('#p_forward').removeClass('disabled');
    } else {
      $('#p_forward').addClass('disabled');
    }
    $('#p_current_page_btn').text(CURRENT_PAGE);
    $('#pagination').show();
  }
  
  API.loadData = function() {
    API.params['q'] = $('#search-input').val();
    API.params['start'] = (CURRENT_PAGE - 1) * ITEMS_PER_PAGE;
    $('#payments-table tbody').empty();
    API.showAPIMsg(USER_MSGS['LOADING']);
    
    $.ajax({
      url: API_URL + PAYMENTS_ENDPOINT,
      method: 'GET',
      cache: false,
      dataType: 'json',
      data: this.params,
      success: function(data) {
        $('#payments-table tbody').empty();
        if (data.hits.total > 0) {
          API.displaySearchResults(data);
          API.updatePaginationDisplay(data.hits.total);
        } else {
          $('#pagination').hide();
          API.showAPIMsg(USER_MSGS['NO_DATA']);
        }
      },
      fail: function() {
        API.showAPIMsg(USER_MSGS['API_NOT_AVAILABLE']);
      }
    })
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
      CURRENT_PAGE = 1;
      API.loadData();
    });
    
    $('#search-input').keyup(function(e){
      if(e.keyCode == 13) {
        CURRENT_PAGE = 1;
        API.loadData();
      }
    });
    
    $('#p_backward_btn').click(function(e) {
      CURRENT_PAGE -= 1;
      API.loadData();
      e.preventDefault();
    });
    $('#p_forward_btn').click(function(e) {
      CURRENT_PAGE += 1;
      API.loadData();
      e.preventDefault();
    });
    
  }
  
  return API;

}(API || {}, jQuery));
