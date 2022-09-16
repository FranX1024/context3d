/*** DEMO ***/
var keydown = {};
var img = new Image();
img.src = './texture.png';
let faces = [];
// upper left triangle
faces.push(Face(
    img,
    // 3d space coordinates
    point3d(-1, -1, 0),
    point3d(-1, 1, 0),
    point3d(1, -1, 0),
    // texture coordinates
    point2d(0, 0),
    point2d(0, 400),
    point2d(400, 0)
));
// bottom right triangle
faces.push(Face(
    img,
    // 3d space coordinates
    point3d(1, 1, 0),
    point3d(1, -1, 0),
    point3d(-1, 1, 0),
    // texture coordinates
    point2d(400, 400),
    point2d(400, 0),
    point2d(0, 400)
));
/* testing splitface *//*
let mypl = Plane(
    point3d(0, 0, 0),
    point3d(0, 0, 1),
    point3d(0, 1, 1)
);
let faces2 = [
    ...splitface(faces[0], mypl),
    ...splitface(faces[1], mypl)
];
faces = faces2;
/* ----------------- */
window.addEventListener('load', function() {
    let canvas = document.querySelector('#mycanv');
    ctx3 = Context3D(canvas);
    let a1 = 0, a2 = 0, dist = 2;
    setInterval(function(){
	if(keydown[40]) {
	    a1 -= Math.PI * .03;
	}
	if(keydown[38]) {
	    a1 += Math.PI * .03;
	}
	if(keydown[37]) {
	    a2 -= Math.PI * .03;
	}
	if(keydown[39]) {
	    a2 += Math.PI * .03;
	}
	if(keydown[88]) {
	    dist -= .15;
	}
	if(keydown[89]) {
	    dist += .15;
	}
	ctx3.ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx3.camera.tfm =
	    transform.shift(0, 0, dist)
	    .mul(transform.rotx(a1+0.001))
	    .mul(transform.roty(a2+0.001));
	ctx3.camera.update_geometry();
	for(let i = 0; i < faces.length; i++) ctx3.fdraw(faces[i]);
    }, 40);
    // keys
    document.addEventListener('keydown', (e) => keydown[e.keyCode] = true);
    document.addEventListener('keyup', (e) => keydown[e.keyCode] = false);
});
/*** **** ***/

/*
TODO: implement
 * rendering order
 * clipping parts outside of view

Plane intersection:
[a1 b1 c1 d1] [x]   [0]
[a2 b2 c2 d2] [y] = [0]
[a3 b3 c3 d3] [z]   [0]
[ 0  0  0  1] [1]   [1]
*/
