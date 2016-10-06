import { tooltip } from './tooltip'; 
import { drawVoronoiOverlay } from './drawVoronoiOverlay'; 
import * as d3 from 'd3';
import _ from 'lodash';

export function drawVoronoiScatterplot(selector, inputData, options) {
  //
  // Set-up
  //

  // vanilla JS window width and height
  const wV = window;
  const dV = document;
  const eV = dV.documentElement;
  const gV = dV.getElementsByTagName('body')[0];
  const xV = wV.innerWidth || eV.clientWidth || gV.clientWidth;
  const yV = wV.innerHeight || eV.clientHeight || gV.clientHeight;

  // Quick fix for resizing some things for mobile-ish viewers
  const mobileScreen = (xV < 500);

  // set default configuration
  const cfg = {
    margin: { left: 120, top: 20, right: 80, bottom: 20 },
    width: 1000,
    animateFromXAxis: undefined,
    hideXLabel: undefined,
    yVariable: 'y',
    yExponent: 0.5,
    idVariable: undefined,
    voronoiStroke: 'none',
    marks: {
      r: 2,
      fillOpacity: 0.3
    }
  };

  // Put all of the options into a variable called cfg
  if (typeof options !== 'undefined') {
    for (const i in options) {
      if (typeof options[i] !== 'undefined') { cfg[i] = options[i]; }
    }// for i
  }// if
  // console.log('options passed in to scatterplot', options);
  // console.log('cfg from scatterplot', cfg);

  // map variables to our dataset
  const xVariable = cfg.xVariable;
  const yVariable = cfg.yVariable;
  const rVariable = undefined;
  let idVariable = cfg.idVariable;
  let groupByVariable = cfg.groupByVariable;
  const wrapperId = cfg.wrapperId;
  const wrapperLabel = cfg.wrapperLabel;
  const tooltipVariables = cfg.tooltipColumns;
  const numericVariables = cfg.numericColumns;
  const xLabelDetail = cfg.xLabelDetail;
  const hideXLabel = cfg.hideXLabel;
  const xLabelTransform = cfg.xLabelTransform;
  const yLabelTransform = cfg.yLabelTransform;
  const dependent = cfg.dependent;
  const globalExtents = cfg.globalExtents;
  const animateFromXAxis = cfg.animateFromXAxis;
  const opacityCircles = cfg.marks.fillOpacity;
  const marksRadius = cfg.marks.r;
  const dynamicWidth = cfg.dynamicWidth;
  const voronoiStroke = cfg.voronoiStroke;
  const yScaleType = cfg.yScaleType;
  const yScaleExponent = cfg.yScaleExponent;

  // labels
  let xLabel = cfg.xLabel || xVariable;
  if (typeof xLabelDetail !== 'undefined') { 
    xLabel = `${xLabel} (${xLabelDetail})` 
  }
  const yLabel = cfg.yLabel || yVariable;;
  // const xLabel = 'y\u{0302}'; // y-hat for the prediction
  // const yLabel = 'r\u{0302}'; // r-hat for the residual

  const div = d3.select(selector)
    .append('div')
    .attr('id', 'chart');

  // Scatterplot
  const margin = cfg.margin;
  const chartWidth = document.getElementById('chart').offsetWidth;
  const height = cfg.width * 0.25;
  // const maxDistanceFromPoint = 50;

  let width;
  if (typeof dynamicWidth !== 'undefined') {
    // use a dynamic width derived from the window width
    width = chartWidth - margin.left - margin.right;
  } else {
    // use width specified in the options passed in
    width = cfg.width - margin.left - margin.right;
  }

  const svg = div
    .append('svg')
      .attr('width', (width + margin.left + margin.right))
      .attr('height', (height + margin.top + margin.bottom));

  const wrapper = svg.append('g')
    .classed('chartWrapper', true)
    .classed(`${xVariable}`, true)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  if (typeof dependent !== 'undefined') {
    svg.classed('dependent', true);
    wrapper.classed('dependent', true);
    wrapper.attr('id', wrapperId);

    // draw model label
    wrapper.append('g')
      .attr('transform', `translate(${20}, ${45})`)
      .append('text')
      .classed('modelLabel', true)
      .style('font-size', '40px')
      .style('font-weight', 400)
      .style('opacity', 0.15)
      .style('fill', 'gray')
      .style('font-family', 'Work Sans, sans-serif')
      .text(`${wrapperLabel}`);
  } else {
    svg.classed('independent', true);
    wrapper.classed('independent', true);
    wrapper.attr('id', wrapperId);
  }

  //
  // Initialize Axes & Scales
  //

  // Set the color for each region
  const color = d3.scaleOrdinal()
    .range([
      '#1f78b4',
      '#ff7f00',
      '#33a02c',
      '#e31a1c',
      '#6a3d9a',
      '#b15928',
      '#a6cee3',
      '#fdbf6f',
      '#b2df8a',
      '#fb9a99',
      '#cab2d6',
      '#ffff99'
    ]);

  // parse strings to numbers
  let data = _.cloneDeep(inputData);
  // console.log('data from scatterplot', data);

  data.forEach((d, i) => {
    numericVariables.forEach(e => {
      d[e] = Number(d[e]);
    })

    if (typeof idVariable === 'undefined') {
      data[i].id = `${i}`;
    }
  })

  // check to see if all points to be plotted are unique
  const pointsData = data.map(d => ({
    x: d[xVariable],
    y: d[yVariable]
  }));
  const uniquePoints = _.uniqWith(pointsData, _.isEqual);
  const uniquePointsLength = uniquePoints.length;
  const dataLength = data.length;
  console.log('uniquePointsLength', uniquePointsLength);
  console.log('dataLength', dataLength);
  console.log('all points unique?', uniquePointsLength === dataLength);

  if (typeof idVariable === 'undefined') idVariable = 'id';
  // console.log('data from drawVoronoiScatterplot', data);
 
  //
  // Scales
  //

  // Set the new x axis range
  const xScale = d3.scaleLinear()
    .range([0, width]);

  // Set the new y axis range
  let yScale;

  switch (yScaleType) {
    case 'power':
      yScale = d3.scalePow()
        .range([height, 0])
        .exponent(yScaleExponent); 
      break;
    default:
      yScale = d3.scaleLinear()
        .range([height, 0]);
  }

  if (typeof globalExtents !== 'undefined') {
    // retrieve global extents
    const xExtent = globalExtents[0];
    const yExtent = globalExtents[1];

    // set scale domains with global extents
    xScale.domain(xExtent);
    yScale
      .domain(yExtent)
      .nice();
  } else {
    // set scale domains from the local extent
    xScale
      .domain(d3.extent(data, d => d[xVariable]))
      // .nice();
    yScale
      .domain(d3.extent(data, d => d[yVariable]))
      .nice();
  }
  // console.log('yScale.domain()', yScale.domain());

  //
  // Axes
  //

  // Set new x-axis
  const xAxis = d3.axisBottom()
    .ticks(4)
    .tickSizeOuter(0)
    // .tickFormat(d => // Difficult function to create better ticks
    //   xScale.tickFormat((mobileScreen ? 4 : 8), e => {
    //     const prefix = d3.format(',.0s');
    //     return `${prefix(e)}`;
    //   })(d))
    .scale(xScale);

  // calculate y-position we'd like for the x-axis
  const xAxisYTranslate = d3.max([0, yScale.domain()[0]]);

  // Append the x-axis
  wrapper.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(${0}, ${yScale(xAxisYTranslate)})`)
    .call(xAxis);

  const yAxis = d3.axisLeft()
    .ticks(6)  // Set rough # of ticks
    .scale(yScale);

  // Append the y-axis
  wrapper.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${0}, ${0})`)
      .call(yAxis);

  // Scale for the bubble size
  if(typeof rVariable !== 'undefined') {
    const rScale = d3.scaleSqrt()
      .range([
        mobileScreen ? 1 : 2,
        mobileScreen ? 10 : 16
      ])
      .domain(d3.extent(data, d => d[rVariable]));
  }

  //
  // Tooltips
  //

  const tip = tooltip(tooltipVariables);
  svg.call(tip);

  //
  // Scatterplot Circles
  //

  // Initiate a group element for the circles
  const circleGroup = wrapper.append('g')
    .attr('class', 'circleWrapper');

  function update(data, options) {
    console.log('update function was called');
    // console.log('data from update function', data);
    
    // handle NaN values
    data = data.filter(d => {
      return !Number.isNaN(d[xVariable]) && !Number.isNaN(d[yVariable]);
    });

    // an extra delay to allow large 
    // amounts of points time to render
    let marksDelay = 0;
    if (typeof options !== 'undefined') {
      marksDelay = options.marksDelay;

      // if a new groupByVariable is passed in, use it
      if (typeof options.groupByVariable !== 'undefined') {
        groupByVariable = options.groupByVariable;
      };
    } 

    // Place the circles
    const updateSelection = circleGroup.selectAll('circle') // circleGroup.selectAll('.marks')
      .data(() => {
          if (typeof rVariable !== 'undefined') {
            // Sort so the biggest circles are below
            return data.sort((a, b) => b[rVariable] > a[rVariable]);
          }
          return data;
        }, d => d[idVariable]
      );
    // console.log('updateSelection', updateSelection);

    const enterSelection = updateSelection.enter()
      .append('circle');
    // console.log('enterSelection', enterSelection);

    const exitSelection = updateSelection.exit();
    // console.log('exitSelection', exitSelection);

    updateSelection
      // .style('fill', 'black');

    enterSelection
      .attr('class', (d) => `marks id${xVariable}${yVariable}${d[idVariable]}`)
      .style('fill-opacity', 0)
      .style('fill', d => {
        // console.log('d from style', d);
        if (typeof groupByVariable !== 'undefined') {
          return color(d[groupByVariable]);
        } 
        return color.range()[0]; // 'green'
      })
      .attr('cx', d => {
        // console.log('cx parameters from drawVoronoiScatterplot');
        // console.log('xScale', xScale);
        // console.log('d', d);
        // console.log('xVariable', xVariable);
        // console.log('xScale(d[xVariable])', xScale(d[xVariable]));
        return xScale(d[xVariable]);
      })
      .attr('cy', d => {
        if (typeof animateFromXAxis !== 'undefined') {
          return yScale(xAxisYTranslate);
        } else {
          return yScale(d[yVariable]);
        }
      })
      .attr('r', d => {
        if (typeof rVariable !== 'undefined') {
          return rScale(d[rVariable])
        } 
        return marksRadius; 
      })
      .transition()
      .delay(marksDelay)
      .duration(2000)
      .style('fill-opacity', opacityCircles);
      // .append('title')
      //   .text(d => `${d[idVariable]} ${d[xLabelDetail]}`);

    exitSelection
      .transition()
      .delay(marksDelay)
      .duration(0)
      .style('fill', 'lightgray') // 'red'
      .transition()
      .delay(2000)
      .duration(2000)
      .style('fill-opacity', 0)
      .remove(); 

    const mergedSelection = updateSelection.merge(enterSelection);
    // console.log('mergedSelection', mergedSelection);
    // console.log('mergedSelection.nodes()', mergedSelection.nodes());
    const mergedSelectionData = mergedSelection.nodes().map(d => d.__data__);
    // console.log('mergedSelectionData', mergedSelectionData);

    if (typeof animateFromXAxis !== 'undefined') {
      updateSelection
        .transition()
        .delay(2000)
        .duration(2000)
        .attr('cy', d => yScale(d[yVariable]));
    }

    //
    // distance-limited Voronoi overlay
    //

    const voronoiOptions = {
      xVariable,
      yVariable,
      idVariable,
      xScale,
      yScale,
      width,
      height,
      tip,
      voronoiStroke
    }
    drawVoronoiOverlay(wrapper, mergedSelectionData, voronoiOptions);
  }

  // call the update function once to kick things off
  update(data);

  //
  // Initialize Labels
  //

  const xlabelText = xLabel || xVariable;
  const yLabelText = yLabel || yVariable;

  if (typeof hideXLabel === 'undefined') {
    // Set up X axis label
    let xTextAnchor = 'start';
    let xLabelTranslate;
    if (xLabelTransform === 'top') {
      // label on top
      xLabelTranslate = `translate(${30},${-10})`;
    } else if (typeof xLabelTransform !== 'undefined') {
      // use specified [x, y, rotate] transform
      xLabelTranslate = `rotate(${yLabelTransform[2]}) translate(${xLabelTransform[0]},${xLabelTransform[1]})`;
    } else {
      // default to no translation
      xLabelTranslate = `translate(${width},${height - 10})`
      xTextAnchor = 'end';
    }

    wrapper.append('g')
      .append('text')
      .attr('class', 'x title')
      .attr('text-anchor', xTextAnchor)
      .style('font-size', `${mobileScreen ? 8 : 12}px`)
      .style('font-weight', 600)
      .attr('transform', xLabelTranslate)
      .text(`${xlabelText}`);
  }

  // Set up y axis label
  let yLabelTranslate;
  if (yLabelTransform === 'left') {
    // label on the left
    yLabelTranslate = `translate(${-(margin.left / 4)},${yScale(xAxisYTranslate)})`;
  } else if (typeof yLabelTransform !== 'undefined') {
    // use specified [x, y, rotate] transform
    yLabelTranslate = `rotate(${yLabelTransform[2]}) translate(${yLabelTransform[0]},${yLabelTransform[1]})`;
  } else {
    // default
    yLabelTranslate = `rotate(270) translate(${0},${10})`
  }

  wrapper.append('g')
    .append('text')
    .attr('class', 'y title')
    .attr('text-anchor', 'end')
    .attr('dy', '0.35em')
    .style('font-size', `${mobileScreen ? 8 : 12}px`)
    .style('font-weight', 600)
    // .attr('transform', 'translate(18, 0) rotate(-90)')
    .attr('transform', yLabelTranslate)
    .text(`${yLabelText}`);

  //
  // Hide axes on click
  //
  let axisVisible = true;

  function click() {
    if (axisVisible) {
      d3.selectAll('.y.axis')
        .style('opacity', 0);
      d3.selectAll('.x.axis text')
        .style('opacity', 0);
      d3.selectAll('.x.axis .tick')
        .style('opacity', 0);
      axisVisible = false;
    } else {
      d3.selectAll('.axis')
        .style('opacity', 1);
      d3.selectAll('.x.axis text')
        .style('opacity', 1);
      d3.selectAll('.x.axis .tick')
        .style('opacity', 1);
      axisVisible = true;
    }
  }

  d3.selectAll('.chartWrapper')
    .on('click', () => {
      click();
    });

  // console.log('update from drawVoronoiScatterplot', update);
  return update;

  // drawVoronoiScatterplot.update = (data) => {
  //   // console.log('drawVoronoiScatterplot.update() was called');
  //   if (typeof update === 'function') update(data);
  // };


}