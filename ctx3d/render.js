function Camera(width, height, fov, pos, facing) {
    let cam = {
	fov: 0,
	width: width,
	height: height,
	tfm: null,
	project(pt) {
	    let pvec = this.tfm.mul(pt.vec());
	    let ff = 1 / pvec.data[2][0];
	    return point2d(
		this.width * .5 * (1 + this.fov * ff * pvec.data[0][0]),
		this.height * .5 * (1 + ff * pvec.data[1][0])
	    );
	},
	setfov(fov) {
	    this.fov = Math.tan(fov * .5);
	},
	// view point
	setvp(pos, facing) {
	    let v2 = facing.vec();
	    let trlate = transform.shift(-pos.x, -pos.y, -pos.z);
	    this.tfm = trlate;
	    v2 = trlate.mul(v2);this.v2=v2;/**/
	    // rot y
	    let ay = -getangle(v2.data[2][0], v2.data[0][0]);
	    let ry = transform.roty(ay);
	    v2 = ry.mul(v2);
	    this.tfm = ry.mul(this.tfm);/**/
	    // rot x
	    let ax = getangle(v2.data[2][0], v2.data[1][0]);this.ax=ax;
	    let rx = transform.rotx(ax);
	    v2 = rx.mul(v2);
	    this.tfm = rx.mul(this.tfm);/**/
	}
    };
    if(fov !== undefined) cam.setfov(fov);
    if(pos !== undefined) cam.setvp(pos, facing);
    return cam;
}

function Face(img, p1, p2, p3, t1, t2, t3) {
    return {p1, p2, p3, img, t1, t2, t3};
}

// mid point on a line
function pavg(p1, p2) {
    if(p1.z !== undefined) {
	return point3d(.5 * (p1.x + p2.x), .5 * (p1.y + p2.y), .5 * (p1.z + p2.z));
    } else {
	return point2d(.5 * (p1.x + p2.x), .5 * (p1.y + p2.y));
    }
}

function Context3D(canv, ffov) {
    let ctx = canv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ffov = ffov || .5*Math.PI;
    return {
	width: canv.width,
	height: canv.height,
	pixacc: 400,
	ctx: ctx,
	camera: Camera(canv.width, canv.height, ffov, point3d(0, 0, -2), point3d(0, 0, 0)),
	lineardraw(face) {
	    let p1 = this.camera.project(face.p1);
	    let p2 = this.camera.project(face.p2);
	    let p3 = this.camera.project(face.p3);
	    let midp = point2d(.333*(p1.x+p2.x+p3.x),.333*(p1.y+p2.y+p3.y));
	    // cover the gaps between triangles
	    aa = 1.1, bb = .1;
	    p1 = point2d(p1.x * aa - midp.x * bb, p1.y * aa - midp.y * bb);
	    p2 = point2d(p2.x * aa - midp.x * bb, p2.y * aa - midp.y * bb);
	    p3 = point2d(p3.x * aa - midp.x * bb, p3.y * aa - midp.y * bb);
	    try {
		let matr = interpolate(
		    face.t1, face.t2, face.t3,
		    p1.vec(), p2.vec(), p3.vec()
		);
		this.ctx.save();
		this.ctx.beginPath(p1.x, p1.y);
		this.ctx.lineTo(p2.x, p2.y);
		this.ctx.lineTo(p3.x, p3.y);
		this.ctx.lineTo(p1.x, p1.y);
		this.ctx.clip();
		this.ctx.transform(
		    matr.data[0][0], matr.data[1][0],
		    matr.data[0][1], matr.data[1][1],
		    matr.data[0][2], matr.data[1][2]
		);
		this.ctx.drawImage(face.img, 0, 0);
		this.ctx.restore();
	    } catch(err) {}
	},
	// interpolation
	idraw(face) {
	    let p1 = this.camera.project(face.p1);
	    let p2 = this.camera.project(face.p2);
	    let p3 = this.camera.project(face.p3);
	    let P = .5 * Math.abs(
		p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)
	    );
	    if(P <= this.pixacc) this.lineardraw(face);
	    else {
		let p12 = pavg(face.p1, face.p2);
		let p23 = pavg(face.p2, face.p3);
		let p31 = pavg(face.p3, face.p1);
		let t12 = pavg(face.t1, face.t2);
		let t23 = pavg(face.t2, face.t3);
		let t31 = pavg(face.t3, face.t1);
		this.idraw(Face(face.img,
				face.p1, p12, p31,
				face.t1, t12, t31
			       )
			  );
		this.idraw(Face(face.img,
				face.p2, p23, p12,
				face.t2, t23, t12
			       )
			  );
		this.idraw(Face(face.img,
				face.p3, p23, p31,
				face.t3, t23, t31
			       )
			  );
		this.idraw(Face(face.img,
				p12, p23, p31,
				t12, t23, t31
			       )
			  );
	    }
	}
    };
}
