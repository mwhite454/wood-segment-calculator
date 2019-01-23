const svg = document.getElementById('mySVG')
const myForm = document.getElementById('myInputs');
const TWO_PI = 6.28318530717958647693
const myInputs = [
    {label: 'SVG X scale', id: 'x', type: 'text', action: (x)=>{svg.setAttribute('width', `${x}cm`)}},
    {label: 'SVG Y scale', id: 'y', type: 'text', action: (y)=>{svg.setAttribute('height', `${y}cm`)}},
    {label: 'Ring Count', id: 'rCount', type: 'text'},
    {label: 'Segments per ring', id: 'segCount', type: 'text'},
    {label: 'Ring Diameter', id: 'rDiameter', type: 'text'},
    {label: 'Wall Thickness', id: 'wThickness', type: 'text'},
    {label: 'Trapezoid Count', id: 'tCount', type: 'text'},
    {label: 'Clear SVG', id:'clear-all', type: 'button', action: ()=>{clearSVG()}},
    {label: 'Draw SVG', id:'draw', type: 'button', action: ()=>{renderSVG()}}
]



const svgChildren = [];

function polygonSegmentLength(points){
    //returns the angle and unique lengths of inner and outer radius for a given polygon
    let angle = TWO_PI / points;
    let radius = parseFloat(inputs.rDiameter.value, 10) / 2;
    let innerRadius = radius - parseFloat(inputs.wThickness.value, 10);
    let center = {x: parseFloat(inputs.x.value, 10)/2, y: parseFloat(inputs.y.value, 10)/2}
    //let outerCoordinate1 = {x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius }
    //let innerCoordinate1 = {x: center.x + Math.cos(angle) * innerRadius, y: center.y + Math.sin(angle) * innerRadius }
    //let outerCoordinate2 = {x: moveX(outerCoordinate1.x, angle, radius), y: moveY(outerCoordinate1.y, angle, radius)} 
    //let innerCoordinate2 = {x: moveX(innerCoordinate1.x, angle, innerRadius), y: moveY(innerCoordinate1.y, angle, innerRadius)}
    let outerRing = polygon(center.x, center.y, radius, points)
    let innerRing = polygon(center.x, center.y, innerRadius, points)
    let outerCoordinate1 = {x: outerRing[0][0], y: outerRing[0][1]}
    let outerCoordinate2 = {x: outerRing[1][0], y: outerRing[1][1] }
    let innerCoordinate1 = {x: innerRing[0][0], y: innerRing[0][1]}
    let innerCoordinate2 = {x: innerRing[1][0], y: innerRing[1][1] }
    let resp = {angle: angle, outerSegLength: distance(outerCoordinate1, outerCoordinate2), innerSegLength: distance(innerCoordinate1, innerCoordinate2)};
    drawPolygon(outerRing)
    drawPolygon(innerRing)
    drawLine(outerCoordinate1, outerCoordinate2)
    drawLine(innerCoordinate1, innerCoordinate2)
    console.log(resp)
    return resp;
}

function drawLine (coord1, coord2){
    let aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('transform', 'scale(35.43307)')
    aLine.setAttribute('x1', `${coord1.x}`)
    aLine.setAttribute('y1', `${coord1.y}`)
    aLine.setAttribute('x2', `${coord2.x}`)
    aLine.setAttribute('y2', `${coord2.y}`)
    aLine.setAttribute('stroke', 'black');
    aLine.setAttribute('stroke-width', 0.15)
    g.appendChild(aLine)
    svg.appendChild(g)
}

function drawPolygon (points){
    let pLine = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('transform', 'scale(35.43307)')
    pLine.setAttribute('stroke', 'red');
    pLine.setAttribute('stroke-width', 0.25);
    pLine.setAttribute('fill', 'none')
    let coordinates = points.reduce((a,c)=>{
        a+= ` ${c.join(',')}`
        return a
    }, '')
    pLine.setAttribute('points', coordinates)
    g.appendChild(pLine)
    svg.appendChild(g)
}

function polygon (x, y, radius, nPoints){
    let angle = TWO_PI / nPoints;
    let points = []
    for(let a = 0; a<TWO_PI; a+= angle){
        let set = []
        set.push(x + Math.cos(a) * radius);
        set.push(y + Math.sin(a) * radius);
        points.push(set)
    }
    //drawPolygon(points)
    console.log(points)
    return points
}

function distance(coord1, coord2){
    console.log('coordinate1: ', coord1)
    console.log('coordinate2: ', coord2)
    let xDiff = Math.pow(coord2.x - coord1.x, 2)
    let yDiff = Math.pow(coord2.y - coord1.y, 2)
    let sum = xDiff + yDiff
    let dist = Math.sqrt(sum)
    return dist
}

function moveX(x, a, r){
    return x + Math.cos((a+a)) * r
}

function moveY(y, a, r){
    return y + Math.sin((a+a)) * r
}

function renderSVG(){
    polygonSegmentLength(inputs.segCount.value)
    //const elements = svgChildren.map(makeTrapezoid)
    //elements.forEach(x => svg.appendChild(x))
}

function clearSVG(){
    console.log('click')

    console.log(svg.hasChildNodes())
    while(svg.hasChildNodes()){
        let elem = svg.firstChild
        elem.remove()
        //svg.removeChild(svg.firstChild)
    }
    //svgChildren.length = 0;
    //renderSVG()
}

function onChange(e) {
    e.preventDefault();
    inputs[e.target.id].value = e.target.value;
    if(typeof inputs[e.target.id].action !== 'undefined'){
        inputs[e.target.id].action(e.target.value)
    }
    //renderSVG()
    console.log(inputs)
}

function addInput(parent, child){
    let newDiv = document.createElement('div')
    newDiv.setAttribute('class', 'wrap')
    let newLabel = document.createElement('label')
    let node = document.createTextNode(`${child.label} : `);
    let newInput = document.createElement('input');
    newInput.setAttribute('type', child.type)
    newInput.setAttribute('id', child.id)
    newInput.addEventListener(child.type=="text" ? "change" : "click", onChange)
    newLabel.appendChild(node);
    newDiv.appendChild(newLabel);
    newDiv.appendChild(newInput);
    parent.appendChild(newDiv);
}

const inputs = myInputs.reduce((a, c)=>{
    a[c.id] = {value: 0, action: c.action}
    return a;
}, {});
myInputs.forEach(i =>{addInput(myForm, i)})


/*
inputs.forEach(i => {
    i.addEventListener("change", onChange)
});
*/

