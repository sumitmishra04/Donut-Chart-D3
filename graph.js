const dim = {
    height: 300, width: 300, radius: 150
}

const cent = { x: (dim.width / 2 + 5), y: (dim.height / 2 + 5) }

const svg = d3.select('.canvas').append('svg')
    .attr('width', dim.width + 150)
    .attr('height', dim.height + 150);

const graph = svg.append('g').attr('transform', `
translate(${cent.x}, ${cent.y})`);

const pie = d3.pie()
    .sort(null)
    .value(d => d.cost);

const arcPath = d3.arc().outerRadius(dim.radius).innerRadius(dim.radius / 2);

const color = d3.scaleOrdinal(d3['schemeSet3']);

// legend setup
const legendGroup = svg.append('g')
    .attr('transform', `translate(${dim.width + 40}, 10)`)

const legend = d3.legendColor()
    .shape('path', d3.symbol().type(d3.symbolCircle)())
    .shapePadding(10)
    .scale(color);

const tip = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
        let content = `<div class="name">${d.data.name}</div>`;
        content += `<div class="cost">£${d.data.cost}</div>`;
        content += `<div class="delete">Click slice to delete</div>`
        return content;
    });

graph.call(tip);


const update = data => {

    // update colour scale domain
    color.domain(data.map(d => d.name));

    // update legend
    legendGroup.call(legend);
    legendGroup.selectAll('text').attr('fill', 'white');
    //join enhanced pie data to path elements
    const path = graph.selectAll('path')
        .data(pie(data));

    path.exit().transition().duration(750)
        .attrTween("d", arcTweenExit).remove();

    // handle the current DOM path updates
    path.transition().duration(750)
        .attrTween("d", arcTweenUpdate);

    path.attr('class', 'arc')
        .attr('d', arcPath)
        .attr('stroke', '#fff')
        .attr('stroke-width', '2')
        .attr('fill', d => color(d.data.name))

    path.enter().append('path')
        .attr('class', 'arc')
        .attr('stroke', '#fff')
        .attr('stroke-width', '3')
        .attr('fill', d => color(d.data.name))
        .transition().duration(750)
        .attrTween("d", arcTweenEnter);

    // add events
    graph.selectAll('path')
        .on('mouseover', (d, i, n) => {
            tip.show(d, n[i]);
            handleMouseOver(d, i, n);
        })
        .on('mouseout', (d, i, n) => {
            tip.hide();
            handleMouseOut(d, i, n);
        })
        .on('click', handleClick);

};


var data = [];
db.collection('expenses').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), id: change.doc.id, type: change.type };

        // console.log('snapshhot', doc);
        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                console.log('Data modified', data)
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }

    });
    update(data);
});

const arcTweenEnter = (d) => {
    var i = d3.interpolate(d.endAngle, d.startAngle);

    return function (t) {
        d.startAngle = i(t);
        return arcPath(d);
    }
};
const arcTweenExit = (d) => {
    var i = d3.interpolate(d.startAngle, d.endAngle);

    return function (t) {
        d.startAngle = i(t);
        return arcPath(d);
    }
};

// use function keyword to allow use of 'this'
function arcTweenUpdate(d) {
    console.log(this._current, d);
    // interpolate between the two objects
    var i = d3.interpolate(this._current, d);
    // update the current prop with new updated data
    this._current = i(1);

    return function (t) {
        // i(t) returns a value of d (data object) which we pass to arcPath
        return arcPath(i(t));
    };
};

// event handlers
const handleMouseOver = (d, i, n) => {
    //console.log(n[i]);
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
        .attr('fill', '#fff');
};

const handleMouseOut = (d, i, n) => {
    //console.log(n[i]);
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
        .attr('fill', color(d.data.name));
};

const handleClick = (d) => {
    const id = d.data.id;
    db.collection('expenses').doc(id).delete();
};