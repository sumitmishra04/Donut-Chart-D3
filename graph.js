const dim = {
    height: 300, width:300, radius:150
}

const cent={x: (dim.width/2 + 5), y:(dim.height/2 + 5)}

const svg = d3.select('.canvas').append('svg')
.attr('width', dim.width + 150)
.attr('height', dim.height + 150);

const graph = svg.append('g').attr('transform', `
translate(${cent.x}, ${cent.y})`);

const pie = d3.pie()
.sort(null)
.value(d=>d.cost);

const angles = pie([
    {name:'rent1', cost:500},
    {name:'rent2', cost:300},
    {name:'rent3', cost:200}
]);

console.table(angles);