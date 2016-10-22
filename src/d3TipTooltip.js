import d3Tip from './d3-tip-custom';
import * as d3 from 'd3';

export function tooltip(tooltipVariables) {
  const tip = d3Tip()
    .parent(document.getElementById('chart'))
    .offset([0, 0])
    .direction('n')
    .attr('class', 'd3-tip')
    .html(d => {
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
        const currentRow = `<span style='font-size: 11px; display: block; text-align: center;'>${e.name} ${currentValue}</span>`;
        allRows = allRows.concat(currentRow);
      })
      return `<div style='background-color: white; padding: 5px; border-radius: 6px;
        border-style: solid; border-color: #D1D1D1; border-width: 1px;'>
        ${allRows}
        </div>`
    });

  return tip;
}