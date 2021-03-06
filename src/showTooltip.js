import * as d3 from 'd3';
import * as bsn from 'bootstrap.native';

// Show the tooltip on the hovered over circle
export function showTooltip(d, i, options, popoverTooltip) {
  // test the bootstrap.native import
  // console.log('bsn', bsn);
  const Popover = bsn.__moduleExports.Popover;

  const idVariable = options.idVariable;
  const xVariable = options.xVariable;
  const yVariable = options.yVariable;
  const xSelector = options.xSelector;
  const ySelector = options.ySelector;
  const tip = options.tip;
  const wrapper = options.wrapper;
  const height = options.height;
  const width = options.width;
  const tooltipVariables = options.tooltipVariables;
  const xDroplineTextFormat = options.xDroplineTextFormat;
  const yDroplineTextFormat = options.yDroplineTextFormat;
  // Save the circle element (so not the voronoi which is triggering the hover event)
  // in a variable by using the unique class of the voronoi (idVariable)
  let elementSelector;
  if (
      typeof d.datum !== 'undefined' &&
      typeof d.datum[idVariable] !== 'undefined'
  ) {
    elementSelector = `.marks.id${xSelector}${ySelector}${d.datum[idVariable]}`;
  } else {
    elementSelector = `.marks.id${xSelector}${ySelector}${d[idVariable]}`;
  }
  console.log('elementSelector from showTooltip', elementSelector);

  let element = d3.selectAll(elementSelector);

  const el = element._groups[0];

  function generateHTML() {
      // console.log('d from tooltip html function', d);
      let allRows = '';
      tooltipVariables.forEach((e) => {
        let currentValue;
        let f;
        if (typeof d.datum !== 'undefined') {
          f = d.datum;
        } else {
          f = d;
        }
        // now parse based on the format
        if (typeof e.format !== 'undefined') {
          if (e.type === 'time') {
            // time formatting
            const inputValue = new Date(Number(f[e.name]));
            // TODO: handle case where date values are strings
            const currentFormat = d3.timeFormat(e.format);
            currentValue = currentFormat(inputValue);
          } else {
            // number formatting
            const inputValue = Number(f[e.name])
            const currentFormat = d3.format(e.format);
            currentValue = currentFormat(inputValue);
          }
        } else {
          // no formatting
          currentValue = f[e.name];
        }
        let currentText;
        if (typeof e.valueOnly !== 'undefined') {
          currentText = `${currentValue}`;
        } else {
          currentText = `${e.name} ${currentValue}`;
        }
        const currentRow = `<span style='font-size: 11px; display: block; text-align: center;'>${currentText}</span>`;
        allRows = allRows.concat(currentRow);
      })
      const html = `<div class="popover" role="tooltip">
          <div class="arrow"></div>
          <div class="popover-content">${allRows}</div>
        </div>`;
      // console.log('html from template', html);
      return html;
    };

  // close any lingering tooltips from
  // previous interactions
  d3.selectAll('.popover').remove();

  //Fade out guide lines, then remove them
  d3.selectAll('.guide')
    .transition().duration(200)
    .style('opacity',  0)
    .remove();

  //Define and show the tooltip
  popoverTooltip = new Popover(elementSelector, { 
    trigger: 'hover',
    duration: 100,
    delay: 100,
    template: generateHTML()
  });

  // console.log('popoverTooltip', popoverTooltip);
  popoverTooltip.open();

  //Make chosen circle more visible
  element.style("opacity", 1);

  //Place and show tooltip
  const x = +element.attr("cx");
  const y = +element.attr("cy");
  const color = element.style("fill");

  //
  //Append lines to bubbles that will be used to show the precise data points
  //
  
  //vertical line to x-axis
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
      .text( d3.format(xDroplineTextFormat)(d[xVariable]) )
      .transition().duration(200)
      .style("opacity", 0.5);

  //horizontal line to y-axis
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
      .text( d3.format(yDroplineTextFormat)(d[yVariable]) )
      .transition().duration(200)
      .style("opacity", 0.5);

  return popoverTooltip;
}// function showTooltip