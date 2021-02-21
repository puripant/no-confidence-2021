const width = 300
const height = 300
const margin = { left: 10, right: 10, top: 20, bottom: 0 }
const keys = ['ไม่ไว้วางใจ', 'งดออกเสียง', 'ไม่ลงคะแนน', 'ไว้วางใจ']
const colors = ['salmon', 'gray', 'gray', 'DarkSlateBlue']
const formatPercent = d3.format('.1%')
const formatValue = x => isNaN(x) ? 'N/A' : x.toLocaleString('en')

const link = name => `https://theyworkforus.elect.in.th/people/${name.split(' ').join('-')}`
const image = name => `https://elect.thematter.co/data/politicians/${name.split(' ').join('-')}.jpg`

let x_scale = d3.scaleLinear()
  .range([margin.left, width - margin.right])
let y_scale = d3.scaleBand()
  .rangeRound([margin.top, height - margin.bottom])
  .padding(0.1)
let color_scale = d3.scaleOrdinal()
  .domain(keys)
  .range(colors)

let svg = d3.select('#chart')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
svg.append('g')
  .call(g => g
    .attr('transform', `translate(0,${margin.top})`)
    .call(d3.axisTop(x_scale).ticks(width / 100, '%'))
    .call(g => g.selectAll('.domain').remove())
  )
svg.append('line')
  .style('stroke', 'black')
  .style('stroke-width', 1)
  .attr('x1', x_scale(0.5) + 0.5)
  .attr('y1', margin.top)
  .attr('x2', x_scale(0.5) + 0.5)
  .attr('y2', height - margin.bottom)

let rows
const stack = d3.stack()
  .keys(keys)
  .order(d3.stackOrderNone)
  .offset(d3.stackOffsetExpand)
const t = svg.transition().duration(750)

let draw = () => {
  rows.sort((a, b) => d3.descending(a[sort_key], b[sort_key]))
  series = stack(rows)
    .map(d => (d.forEach(v => v.key = d.key), d))

  svg.selectAll('g')
    .data(series)
    .enter().append('g')
      .attr('fill', d => color_scale(d.key))
    .selectAll('rect')
    .data(d => d)
    .join('rect')
      .call(rect => rect.append('title')
        .text(d => `${d.data.title}${d.data.name}
📌 ${d.data.position}
📊 ${d.key} ${formatValue(d.data[d.key])} คะแนน (${formatPercent(d[1] - d[0])})`))
      .transition(t)
        .attr('x', d => x_scale(d[0]))
        .attr('y', (d, i) => y_scale(d.data.name))
        .attr('width', d => x_scale(d[1]) - x_scale(d[0]))
        .attr('height', y_scale.bandwidth())
}

let sort_key = 'ไม่ไว้วางใจ'
const sort_buttons = {
  ไม่ไว้วางใจ: d3.select('#button-no'),
  ไว้วางใจ: d3.select('#button-yes'),
}
let sort = key => {
  if (key != sort_key) {
    sort_key = key
    for (let key in sort_buttons) {
      sort_buttons[key].classed('highlighted', false)
    }
    sort_buttons[sort_key].classed('highlighted', true)
    
    draw()
  }
}

d3.csv('data.csv').then(data => {
  rows = data
  y_scale.domain(data.map(d => d.name))

  svg = svg.append('g')
  draw()
})