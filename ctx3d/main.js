function Context3D(canvas, fov, vw, vh) {
    fov = fov || Math.PI;
    // virtual canvas
    let vcanvas = document.createElement('canvas');
    vcanvas.width = vw || canvas.width;
    vcanvas.height = vh || canvas.height;
    
    // drawing object
    let drawobj = Draw3D(vcanvas, fov);
    let cam = drawobj.camera;

    // ...
    return {
	drawobj: drawobj,
	canvas: canvas,
	ctx: canvas.getContext('2d'),
	camera: cam,
	objects: new Set(),
	
	/*** camera utility ***/
	setViewPoint(pos, lookat) {
	    this.camera.setvp(pos, lookat);
	},
	setFov(fov) {
	    this.camera.setfov(fov);
	},
	resetViewPoint() {
	    this.camera.tfm = matrix.identity(4);
	},
	rotateViewPoint(rx, ry, rz) {
	    this.camera.tfm =
		transform.rotx(rx)
		.mul(transform.roty(ry))
		.mul(transform.rotz(rz))
		.mul(this.camera.tfm);
	    this.camera.update_geometry();
	},
	moveViewPoint(dx, dy, dz) {
	    this.camera.tfm = transform.shift(-dx,-dy,-dz)
		.mul(this.camera.tfm);
	    this.camera.update_geometry();
	},
	/**********************/

	
	update() {
	    let ufaces = []; // unordered faces taken from this.objects

	    let faces = []; // ordered back to front
	    for(let i = 0; i < faces.length; i++) {
		this.drawobj.fdraw(faces[i])
	    }
	}
    };
}
