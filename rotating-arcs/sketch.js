/**
 * Geometry 
 * by Marius Watz. 
 * 
 * Using sin/cos lookup tables, blends colors, and draws a series of 
 * rotating arcs on the screen.
*/
 
// Trig lookup tables borrowed from Toxi; cryptic but effective.
let sinLUT=[];
let cosLUT=[];
let SINCOS_PRECISION=1.0;
let SINCOS_LENGTH= parseInt((360.0/SINCOS_PRECISION));
 
// System data
let dosave=false;
let num=150;
let pt = [];
let style= [];

 
function setup() {
  createCanvas(1024, 768, WEBGL);
  background(255);
  
  // Fill the tables
  for (let i = 0; i < SINCOS_LENGTH; i++) {
    sinLUT[i] = Math.sin(i*DEG_TO_RAD*SINCOS_PRECISION);
    cosLUT[i] = Math.cos(i*DEG_TO_RAD*SINCOS_PRECISION);
  }
 
  // pt = new Array[6*num]; // rotx, roty, deg, rad, w, speed
  // style = new Array[2*num]; // color, render style
 
  // Set up arc shapes
  let index=0;
  let prob;
  for (let i=0; i<num; i++) {
    pt[index++] = random(PI*2); // Random X axis rotation
    pt[index++] = random(PI*2); // Random Y axis rotation
 
    pt[index++] = random(60,80); // Short to quarter-circle arcs
    if(random(100)>90) pt[index]=parseInt(random(8,27)*10);
 
    pt[index++] = parseInt(random(2,50)*5); // Radius. Space them out nicely
 
    pt[index++] = random(4,32); // Width of band
    if(random(100)>90) pt[index]=random(40,60); // Width of band
 
    pt[index++] = radians(random(5,30))/5; // Speed of rotation
 
    // get colors
    prob = random(100);
    if(prob<30) style[i*2]=colorBlended(random(1), 255,0,100, 255,0,0, 210);
    else if(prob<70) style[i*2]=colorBlended(random(1), 0,153,255, 170,225,255, 210);
    else if(prob<90) style[i*2]=colorBlended(random(1), 200,255,0, 150,255,0, 210);
    else style[i*2]=color(255,255,255, 220);

    if(prob<50) style[i*2]=colorBlended(random(1), 200,255,0, 50,120,0, 210);
    else if(prob<90) style[i*2]=colorBlended(random(1), 255,100,0, 255,255,0, 210);
    else style[i*2]=color(255,255,255, 220);

    style[i*2+1]=parseInt(random(100)%3);
  }
  console.log(sinLUT);
  console.log(cosLUT);
  console.log(style);
  console.log(pt);
}
 
function draw() {
 
  background(0);
 
  let index=0;
  translate(width/2, height/2, 0);
  rotateX(PI/6);
  rotateY(PI/6);
 
  for (let i = 0; i < num; i++) {
    push();
 
    rotateX(pt[index++]);
    rotateY(pt[index++]);
 
    if(style[i*2+1]==0) {
      stroke(style[i*2]);
      noFill();
      strokeWeight(1);
      arcLine(0,0, pt[index++],pt[index++],pt[index++]);
    }
    else if(true || style[i*2+1]==1) {
      fill(style[i*2]);
      noStroke();
      arcLineBars(0,0, pt[index++],pt[index++],pt[index++]);
    }
    else {
      fill(style[i*2]);
      noStroke();
      drawArc(0,0, pt[index++],pt[index++],pt[index++]);
    }
 
    // increase rotation
    pt[index-5]+=pt[index]/10;
    pt[index-4]+=pt[index++]/20;
 
    pop();
  }
}
 
 
// Get blend of two colors
function colorBlended(fract,
		r, g, b,
		r2, g2, b2, a) {
 
  r2 = (r2 - r);
  g2 = (g2 - g);
  b2 = (b2 - b);
  return color(r + r2 * fract, g + g2 * fract, b + b2 * fract, a);
}
 
 
// Draw arc line
function arcLine(x,y,deg,rad,w) {
  let a=parseInt(min (deg/SINCOS_PRECISION,SINCOS_LENGTH-1));
  let numlines=parseInt(w/2);
 
  for (let j=0; j<numlines; j++) {
    beginShape(POINTS);
    for (let i=0; i<a; i++) { 
      vertex(cosLUT[i]*rad+x,sinLUT[i]*rad+y);
    }
    endShape();
    rad += 2;
  }
}
 
// Draw arc line with bars
function arcLineBars(x,y,deg,rad,w) {
  let a = parseInt((min (deg/SINCOS_PRECISION,SINCOS_LENGTH-1)));
  a /= 4;
 
  beginShape(POINTS);
  for (let i=0; i<a; i+=4) {
    vertex(cosLUT[i]*(rad)+x,sinLUT[i]*(rad)+y);
    vertex(cosLUT[i]*(rad+w)+x,sinLUT[i]*(rad+w)+y);
    vertex(cosLUT[i+2]*(rad+w)+x,sinLUT[i+2]*(rad+w)+y);
    // vertex(cosLUT[i+2]*(rad)+x,sinLUT[i+2]*(rad)+y);
  }
  endShape();
}
 
// Draw solid arc
function drawArc(x,y,deg,rad,w) {
  let a = parseInt(min (deg/SINCOS_PRECISION,SINCOS_LENGTH-1));
  beginShape(POINTS);
  for (let i = 0; i < a; i++) {
    vertex(cosLUT[i]*(rad)+x,sinLUT[i]*(rad)+y);
    vertex(cosLUT[i]*(rad+w)+x,sinLUT[i]*(rad+w)+y);
  }
  endShape();
}