// Show the tooltip on the hovered over circle
export function showTooltip(d, i, options) {
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
  const el = element._groups[0];
  //Define and show the tooltip
  tip.show(d, i);

  //Make chosen circle more visible
  element.style("opacity", 1);

  //Place and show tooltip
  const x = +element.attr("cx");
  const y = +element.attr("cy");
  const color = element.style("fill");

  const offsetX = x - (width / 2);
  const offsetY = y - 20;
  // [top, left]
  tip.offset([offsetY, offsetX]);


  //Append lines to bubbles that will be used to show the precise data points
  
  //vertical line
  wrapper
      .append("line")
      .attr("class", "guide")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", y)
      .attr("y2", height + 20)
      .style("stroke", color)
      .style("opacity",  0)
      .transition().duration(200)
      .style("opacity", 0.5);
  //Value on the axis
  wrapper
      .append("text")
      .attr("class", "guide")
      .attr("x", x)
      .attr("y", height + 38)
      .style("fill", color)
      .style("opacity",  0)
      .style("text-anchor", "middle")
      .text( "$ " + d3.format(".2s")(d[xVariable]) )
      .transition().duration(200)
      .style("opacity", 0.5);

  //horizontal line
  wrapper
      .append("line")
      .attr("class", "guide")
      .attr("x1", x)
      .attr("x2", -20)
      .attr("y1", y)
      .attr("y2", y)
      .style("stroke", color)
      .style("opacity",  0)
      .transition().duration(200)
      .style("opacity", 0.5);
  //Value on the axis
  wrapper
      .append("text")
      .attr("class", "guide")
      .attr("x", -25)
      .attr("y", y)
      .attr("dy", "0.35em")
      .style("fill", color)
      .style("opacity",  0)
      .style("text-anchor", "end")
      .text( d3.format(".1f")(d[yVariable]) )
      .transition().duration(200)
      .style("opacity", 0.5); 
}// function showTooltip