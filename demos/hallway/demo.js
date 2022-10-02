/*** DEMO ***/
var keydown = {};
var img = new Image();
img.src = './wall.png';
let faces = [];
    // upper left triangle
    faces.push(Face(
	img,
	// 3d space coordinates
	point3d(-1, -1.5, 0),
	point3d(-1, 1, 0),
	point3d(10, -1.5, 0),
	// texture coordinates
	point2d(0, 0),
	point2d(0, 400),
	point2d(400, 0)
    ));
    // bottom right triangle
    faces.push(Face(
	img,
	// 3d space coordinates
	point3d(10, 1, 0),
	point3d(10, -1.5, 0),
	point3d(-1, 1, 0),
	// texture coordinates
	point2d(400, 400),
	point2d(400, 0),
	point2d(0, 400)
    ));

window.addEventListener('load', function() {
    let canvas = document.querySelector('#mycanv');
    ctx3 = Draw3D(canvas);
    ctx3.camera.setvp(point3d(0, 0, -5), point3d(0, 0, 0));
    ctx3.pixacc = 2000;
    let oldtime = undefined;
    let upd = function(){
	let newtime = new Date().getTime();
	let tspan = oldtime? newtime - oldtime : 100;
	if(keydown[40]) {
	    ctx3.camera.tfm = affine.shift(0, 0, 0.007*tspan).mul(ctx3.camera.tfm);
	}
	if(keydown[38]) {
	    ctx3.camera.tfm = affine.shift(0, 0, -0.007*tspan).mul(ctx3.camera.tfm);
	}
	if(keydown[37]) {
	    ctx3.camera.tfm = affine.roty(Math.PI * .0006*tspan).mul(ctx3.camera.tfm);
	}
	if(keydown[39]) {
	    ctx3.camera.tfm = affine.roty(-Math.PI * .0006*tspan).mul(ctx3.camera.tfm);
	}
	ctx3.camera.update_geometry();
	ctx3.clear();
	ctx3.drawScene(faces);
	oldtime = newtime;
	requestAnimationFrame(upd);
    };
    upd();
    // keys
    document.addEventListener('keydown', (e) => keydown[e.keyCode] = true);
    document.addEventListener('keyup', (e) => keydown[e.keyCode] = false);
});
/*** **** ***/
