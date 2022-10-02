function Context3D(canvas, fov) {
    fov = fov || .5*Math.PI;
    // virtual canvas
    let vcanvas = document.createElement('canvas');
    vcanvas.width = canvas.width;
    vcanvas.height = canvas.height;
    
    // drawing object
    let drawobj = Draw3D(vcanvas, fov);
    let cam = drawobj.camera;

    // ...
    return {
	draw: drawobj,
	canvas: canvas,
	ctx: canvas.getContext('2d'),
	camera: cam,
	faces: [],
	
	/*** camera utility ***/
	setvp(...args) {
	    this.camera.setvp(...args);
	},
	setfov(fov) {
	    this.camera.setfov(fov);
	},
	/**********************/
	
	update() {
	    this.draw.clear();
	    for(let i = 0; i < this.faces.length; i++) {
		this.draw.fdraw(this.faces[i]);
	    }
	    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	    this.ctx.drawImage(vcanvas, 0, 0);
	}
    };
}
