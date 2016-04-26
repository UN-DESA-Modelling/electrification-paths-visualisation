function set_project_cost(tier) {
  _g.country['current_cost'] = d3.select("#costs-graph" + tier + ' > text').text().split(" ")[0];
}

function change_tier(tier) {
  _g.current_tier = tier;
  _g.scenario['tier'] = tier;

  // Buttons
  //
  $('.tier-changer').removeClass('active');
  $('[data-tier=' + tier + ']').closest('.tier-changer').addClass('active');

  // Graphs
  //
  costs_graph_rearrange(tier);

  population_graph_rearrange(tier);

  // Map
  //
  update_map(_g.country);
}

function load_everything(err, all_countries, world_topo, transmission_lines, planned_transmission_lines) {
  if (err) console.warn('error', err);

  var tier, diesel_price;

  var existing_transmission_lines_features = topojson.feature(transmission_lines, transmission_lines.objects["existing-transmission-lines"]).features;
  var planned_transmission_lines_features = topojson.feature(planned_transmission_lines, planned_transmission_lines.objects["planned-transmission-lines"]).features;

  setup_project_countries(all_countries, function() {

    load_world(world_topo, all_countries);

    // Make sure everything is OK
    //
    try {
      _g.country = country_by_iso3(get_query_param('iso3'));
      tier = parseInt(get_query_param('tier'));
      diesel_price = get_query_param('diesel_price');

    } catch (e) {
      alert("Wrong ISO3 code! Bailing out... :(");
      return false;
    }

    if (isNaN(tier) || tier < 1) {
      alert("Wrong tier! Bailing out... :(");
      return false;
    }

    if (diesel_price !== "nps" && diesel_price !== "low") {
      alert("Wrong diesel price! Bailing out... :(");
      return false;
    }

    // TODO: clean this globals up...
    //
    _g.current_tier = tier;
    _g.current_diesel = diesel_price;
    _g.scenario['diesel_price'] = _g.diesel_price[_g.current_diesel];

    var population_svg = d3.select('svg#population')
      .attr({
        width: $('svg#population').parent().width(),
        height: 200
      });

    draw_population_graphs({
      size: _g.population_graph['size'],
      position: _g.population_graph['position'],
      svg: population_svg

    }, _g.country, _g.current_diesel);

    var costs_svg = d3.select('svg#costs')
      .attr({
        width: $('svg#costs').parent().width(),
        height: 300
      });

    draw_costs_graphs({
      size: _g.costs_graph['size'],
      position: _g.costs_graph['position'],
      svg: costs_svg

    }, _g.country, _g.current_diesel);

    $('#loading-screen').fadeOut(600, function() { change_tier(_g.current_tier); });

    $("#diesel-price-selector").change(function() {
      _g.current_diesel = (_g.current_diesel === "nps" ? "low" : "nps");

      _g.scenario['diesel_price'] = _g.diesel_price[_g.current_diesel]

      // TODO: animations instead of this redraw
      // TODO: this is causing unnecessary requests (svg icons)
      //
      $('#population').empty();
      $('#costs').empty();

      draw_population_graphs({
        size: _g.population_graph['size'],
        position: _g.population_graph['position'],
        svg: population_svg

      }, _g.country, _g.current_diesel);

      draw_costs_graphs({
        size: _g.costs_graph['size'],
        position: _g.costs_graph['position'],
        svg: costs_svg

      }, _g.country, _g.current_diesel);
    });

    $('.tier-changer').click(function(e) {
      var tier = parseInt($(e.target).closest('.tier-changer').attr('data-tier'));

      change_tier(tier);
    });

    draw_transmission_lines(existing_transmission_lines_features, "existing");
    draw_transmission_lines(planned_transmission_lines_features, "planned");

    set_project_cost(_g.current_tier);

    rivets.bind($('header'), {
      country: _g.country
    });

    rivets.bind($('#grid-description'), {
      grid: _g.current_grid
    });

    rivets.bind($('#country-stats'), {
      country: _g.country
    });

    rivets.bind($('#scenario-selector'), {
      scenario: _g.scenario
    });

    $('[data-toggle="tooltip"]').tooltip();
  });

  jQuery('.tier-icon').each(function() {
    var $img = jQuery(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgURL = $img.attr('src');

    jQuery.get(imgURL, function(data) {
      // Get the SVG tag, ignore the rest
      var $svg = jQuery(data).find('svg');

      // Add replaced image's ID to the new SVG
      if(typeof imgID !== 'undefined') { $svg = $svg.attr('id', imgID); }

      // Add replaced image's classes to the new SVG
      if(typeof imgClass !== 'undefined') { $svg = $svg.attr('class', imgClass+' replaced-svg'); }

      // Replace image with new SVG
      $img.replaceWith($svg);
    }, 'xml');
  });
}

queue(4)
  .defer(d3.json, './data/country/summaries.json')
  .defer(d3.json, './data/topojson/world-topography.json')
  .defer(d3.json, './data/topojson/existing-transmission-lines.json')
  .defer(d3.json, './data/topojson/planned-transmission-lines.json')
  .await(load_everything);
