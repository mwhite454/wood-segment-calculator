const svg = document.getElementById('mySVG')
const myForm = document.getElementById('myInputs');
const TWO_PI = 6.28318530717958647693
const pixels_per_cm = 35.43307
const cm_per_inch = 2.54
var unit_modifier = 0
const myInputs = [
    {label: 'Unit of Measure (in or cm)', id: 'unit', type: 'text', action: (unit)=>{unit_modifier = unit == 'cm' ? pixels_per_cm : pixels_per_cm * cm_per_inch}},
    {label: 'SVG X scale', id: 'x', type: 'text', action: (x)=>{svg.setAttribute('width', `${x}${inputs.unit.value}`)}},
    {label: 'SVG Y scale', id: 'y', type: 'text', action: (y)=>{svg.setAttribute('height', `${y}${inputs.unit.value}`)}},
    {label: 'Ring Count', id: 'rCount', type: 'text'},
    {label: 'Segments per ring', id: 'segCount', type: 'text'},
    {label: 'Ring Diameter', id: 'rDiameter', type: 'text'},
    {label: 'Wall Thickness', id: 'wThickness', type: 'text'},
    {label: 'Trapezoid Count', id: 'tCount', type: 'text'},
    {label: 'Clear SVG', id:'clear-all', type: 'button', action: ()=>{clearSVG()}},
    {label: 'Draw SVG', id:'draw', type: 'button', action: ()=>{renderSVG()}}
]

function polygonSegmentLength(points){
    //returns the angle and unique lengths of inner and outer radius for a given polygon
    let angle = TWO_PI / points;
    let radius = parseFloat(inputs.rDiameter.value, 10) / 2;
    let innerRadius = radius - parseFloat(inputs.wThickness.value, 10);
    let center = {x: parseFloat(inputs.x.value, 10)/2, y: parseFloat(inputs.y.value, 10)/2}
    let outerRing = polygon(center.x, center.y, radius, points)
    let innerRing = polygon(center.x, center.y, innerRadius, points)
    let outerCoordinate1 = {x: outerRing[0][0], y: outerRing[0][1]}
    let outerCoordinate2 = {x: outerRing[1][0], y: outerRing[1][1] }
    let innerCoordinate1 = {x: innerRing[0][0], y: innerRing[0][1]}
    let innerCoordinate2 = {x: innerRing[1][0], y: innerRing[1][1] }
    let resp = {angle: angle, longLeg: distance(outerCoordinate1, outerCoordinate2), shortLeg: distance(innerCoordinate1, innerCoordinate2)};
    //drawPolygon(outerRing)
    //drawPolygon(innerRing)
    drawLine(outerCoordinate1, outerCoordinate2)
    drawLine(innerCoordinate1, innerCoordinate2)
    console.log(resp)
    return resp;
}

function drawLine (coord1, coord2){
    let aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('transform', `scale(${unit_modifier})`)
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
    g.setAttribute('transform', `scale(${unit_modifier})`)
    pLine.setAttribute('stroke', 'red');
    pLine.setAttribute('stroke-width', 0.05);
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
   let segmentData = polygonSegmentLength(inputs.segCount.value)
   let offSetX = 1 //TO DO make this a global variable`
   let offSetY = 1
   for(let i = 0; i< inputs.segCount.value; i++){
       if(i%2==0){
            make_right_Trapezoid(offSetX, offSetY, parseFloat(inputs.wThickness.value, 10), segmentData.longLeg, segmentData.shortLeg)
            offSetY += segmentData.longLeg 
       } else {
            make_left_Trapezoid(offSetX, offSetY, parseFloat(inputs.wThickness.value, 10), segmentData.longLeg, segmentData.shortLeg)
            offSetY += segmentData.shortLeg
       }
   }
   
}
function make_left_Trapezoid(startX, startY, wallThickness, longLeg, shortLeg){
    let points = []
    let diff = (longLeg - shortLeg) / 2
    points.push([startX + wallThickness, startY - diff])
    points.push([points[0][0], points[0][1] + longLeg])
    points.push([startX, points[1][1] - diff])
    points.push([startX, points[2][1] - shortLeg])
    drawPolygon(points)

}
function make_right_Trapezoid(startX, startY, wallThickness, longLeg, shortLeg){
    let points = []
    let diff = (longLeg - shortLeg) / 2
    points.push([startX, startY])
    points.push([startX + wallThickness, startY + diff])
    points.push([points[1][0], points[1][1] + shortLeg])
    points.push([startX, points[2][1] + diff])
    drawPolygon(points)
}

function clearSVG(){
    while(svg.hasChildNodes()){
        let elem = svg.firstChild
        elem.remove()
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

