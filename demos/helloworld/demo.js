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
/*faces.push(Face(
    img,//'#9f7928',
    point3d(1, 0, 1),
    point3d(-1, 0, 1),
    point3d(-1, 0, -1),
    point2d(0, 0),
    point2d(0, 400),
    point2d(400, 0)
));*/

window.addEventListener('load', function() {
    let canvas = document.querySelector('#mycanv');
    ctx3 = Draw3D(canvas);
    let a1 = 0, a2 = 0, dist = 2;
    setInterval(function(){
	if(keydown[40]) {
	    a1 -= Math.PI * .05;
	}
	if(keydown[38]) {
	    a1 += Math.PI * .05;
	}
	if(keydown[37]) {
	    a2 -= Math.PI * .05;
	}
	if(keydown[39]) {
	    a2 += Math.PI * .05;
	}
	if(keydown[88]) {
	    dist -= .3;
	}
	if(keydown[89]) {
	    dist += .3;
	}
	ctx3.camera.tfm =
	    affine.shift(0, 0, dist)
	    .mul(affine.rotx(a1+0.001))
	    .mul(affine.roty(a2+0.001));
	ctx3.camera.update_geometry();
	ctx3.clear();
	ctx3.drawScene(faces);
    }, 60);
    // keys
    document.addEventListener('keydown', (e) => keydown[e.keyCode] = true);
    document.addEventListener('keyup', (e) => keydown[e.keyCode] = false);
});
/*** **** ***/

/*
TODO: implement
 * rendering order
*/
