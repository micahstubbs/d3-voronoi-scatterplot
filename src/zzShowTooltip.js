  // Show the tooltip on the hovered over circle
 export function showTooltip(d, i, options) {
    const idVariable = options.idVariable;
    const xVariable = options.xVariable;
    const yVariable = options.yVariable;
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

    const pathStartX = Number(d.path.split('M')[1].split(',')[0]);
    const pathStartY = Number(d.path.split(',')[1].split('L')[0]);

    const currentDOMNode = element.nodes()[0];
    const cx = currentDOMNode.cx.baseVal.value;
    const cy = currentDOMNode.cy.baseVal.value;

    tip.show(d, i, nodes);

    const offsetX = 0; // pathStartX + (pathStartX - cx);
    const offsetY = pathStartY + (pathStartY - cy);

    // Make chosen circle more visible
    element.style('fill-opacity', 1);
            
  }// function showTooltip