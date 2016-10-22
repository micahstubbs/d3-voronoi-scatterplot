import * as d3 from 'd3';

//Hide the tooltip when the mouse moves away
export function removeTooltip (d, i, options, popoverTooltip) {
  const idVariable = options.idVariable;
  const xVariable = options.xVariable;
  const yVariable = options.yVariable;
  const tip = options.tip;
  const wrapper = options.wrapper;
  const height = options.height;
  const width = options.width;
  // Save the circle element (so not the voronoi which is triggering the hover event)
  // in a variable by using the unique class of the voronoi (idVariable)
  let elementSelector;
  if (
      typeof d.datum !== 'undefined' &&
      typeof d.datum[idVariable] !== 'undefined'
  ) {
    elementSelector = `.marks.id${xVariable}${yVariable}${d.datum[idVariable]}`;
  } else {
    elementSelector = `.marks.id${xVariable}${yVariable}${d[idVariable]}`;
  }
  
  let element;
  if (
      typeof d.datum !== 'undefined' &&
      typeof d.datum[idVariable] !== 'undefined'
  ) {
    element = d3.selectAll(`.marks.id${xVariable}${yVariable}${d.datum[idVariable]}`);
  } else {
    element = d3.selectAll(`.marks.id${xVariable}${yVariable}${d[idVariable]}`);
  }
    
  // Fade out the bright circle again
  element.style('fill-opacity', 0.3);
  
  //Hide tooltip
  if (typeof popoverTooltip !== 'undefined') {
    popoverTooltip.close();
  }
  
  // $('.popover').each(function() {
  //   $(this).remove();
  // }); 
    
  //Fade out guide lines, then remove them
  d3.selectAll(".guide")
    .transition().duration(200)
    .style("opacity",  0)
    .remove();
    
}//function removeTooltip