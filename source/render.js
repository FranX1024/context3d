function Camera(width, height, fov, pos, facing) {
    let cam = {
	fov: 0,
	width: width,
	height: height,
	tfm: null,
	planes: null, // fov bounding planes
	vp: null, // visible point
	pos: null, // position of camera
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
	    // ...
	    if(this.tfm) this.update_geometry();
	},
	// view point
	setvp(pos, facing) {
	    let v2 = facing.vec();
	    let trlate = affine.shift(-pos.x, -pos.y, -pos.z);
	    this.tfm = trlate;
	    v2 = trlate.mul(v2);this.v2=v2;/**/
	    // rot y
	    let ay = -getangle(v2.data[2][0], v2.data[0][0]);
	    let ry = affine.roty(ay);
	    v2 = ry.mul(v2);
	    this.tfm = ry.mul(this.tfm);/**/
	    // rot x
	    let ax = getangle(v2.data[2][0], v2.data[1][0]);
	    let rx = affine.rotx(ax);
	    v2 = rx.mul(v2);
	    this.tfm = rx.mul(this.tfm);
	    // ...
	    this.update_geometry();
	},
	update_geometry() {
	    let tfminv = this.tfm.inv();
	    this.pos = point3d.from(
		tfminv.mul(
		    matrix([[0],[0],[0],[1]])
		)
	    );
	    this.vp = point3d.from(
		tfminv.mul(
		    matrix([[0],[0],[1],[1]])
		)
	    );
	    let corners = [];
	    for(let i = -1; i <= 1; i += 2) {
		for(let j = -1; j <= 1; j += 2) {
		    corners.push(point3d.from(
			tfminv.mul(
			    matrix([
				[i*this.fov],
				[i*j],
				[1],
				[1]
			    ])
			)
		    ));
		}
	    }
	    this.planes = [];
	    for(let i = 0; i < 4; i++) {
		this.planes.push(Plane(
		    this.pos, corners[i], corners[(i+1) % 4]
		));
	    }
	}
    };
    cam.setfov(fov || Math.PI);
    cam.setvp(pos || point3d(0,0,0), facing || point3d(0,0,1));
    return cam;
};

function _splitface_intersect(p1, p2, plane1, plane2, plane3) {
    let matr = matrix.merge_rows(
	plane1.matr, plane2.matr, plane3.matr,
	matrix([[0, 0, 0, 1]])
    );
    let rvec = matrix([[0],[0],[0],[1]]);
    let ptvec;
    try {
	ptvec = matr.inv().mul(rvec);
    } catch(e) {
	return null;
    }
    let pt = point3d.from(ptvec);
    if(pt.x > Math.max(p1.x, p2.x)+.01 ||
       pt.x < Math.min(p1.x, p2.x)-.01 ||
       pt.y > Math.max(p1.y, p2.y)+.01 ||
       pt.y < Math.min(p1.y, p2.y)-.01 ||
       pt.z > Math.max(p1.z, p2.z)+.01 ||
       pt.z < Math.min(p1.z, p2.z)-.01
      ) return null;
    return pt;
};

function texture_coords(pt, p1, p2, t1, t2) {
    let f3 = 0;
    if(p1.x != p2.x) f3 = (pt.x-p1.x)/(p2.x-p1.x);
    else if(p1.y != p2.y) f3 = (pt.y-p1.y)/(p2.y-p1.y);
    else if(p1.z != p2.z) f3 = (pt.z-p1.z)/(p2.z-p1.z);
    return point2d(
	t1.x + (t2.x - t1.x) * f3,
	t1.y + (t2.y - t1.y) * f3
    );
};

function splitface(face, plane) {
    let fplane = face.plane;
    // independent point
    let ip = independent_point(face.p1, face.p2, face.p3);
    // intersect points
    let p12, p23, p31;
    try {
	p12 = _splitface_intersect(face.p1, face.p2, plane, fplane, Plane(face.p1, face.p2, ip));
	p23 = _splitface_intersect(face.p2, face.p3, plane, fplane, Plane(face.p2, face.p3, ip));
	p31 = _splitface_intersect(face.p3, face.p1, plane, fplane, Plane(face.p3, face.p1, ip));
    } catch(e) {
	return [face];
    }
    // determine how to split the face
    /* not sure if it works */
    if(p31 !== null && p12 !== null) {
	let t31 = texture_coords(p31, face.p3, face.p1, face.t3, face.t1);
	let t12 = texture_coords(p12, face.p1, face.p2, face.t1, face.t2);
	return [
	    Face(face.img, face.p1, p12, p31, face.t1, t12, t31, face.plane),
	    Face(face.img, face.p2, p12, p31, face.t2, t12, t31, face.plane),
	    Face(face.img, face.p2, face.p3, p31, face.t2, face.t3, t31, face.plane)
	];
    }
    else if(p12 !== null && p23 !== null) {
	let t12 = texture_coords(p12, face.p1, face.p2, face.t1, face.t2);
	let t23 = texture_coords(p23, face.p2, face.p3, face.t2, face.t3);
	return [
	    Face(face.img, face.p2, p12, p23, face.t2, t12, t23, face.plane),
	    Face(face.img, face.p1, p23, p12, face.t1, t23, t12, face.plane),
	    Face(face.img, face.p1, face.p3, p23, face.t1, face.t3, t23, face.plane)
	];
    }
    else if(p23 !== null && p31 !== null) {
	let t23 = texture_coords(p23, face.p2, face.p3, face.t2, face.t3);
	let t31 = texture_coords(p31, face.p3, face.p1, face.t3, face.t1);
	return [
	    Face(face.img, face.p3, p23, p31, face.t3, t23, t31, face.plane),
	    Face(face.img, face.p1, p31, p23, face.t1, t31, t23, face.plane),
	    Face(face.img, face.p1, face.p2, p23, face.t1, face.t2, t23, face.plane)
	];
    }
    else if(p12 !== null) {
	let t12 = texture_coords(p12, face.p1, face.p2, face.t1, face.t2);
	return [
	    Face(face.img, face.p1, face.p3, p12, face.t1, face.t3, t12, face.plane),
	    Face(face.img, face.p3, face.p2, p12, face.t3, face.t2, t12, face.plane)
	];
    }
    else if(p23 !== null) {
	let t23 = texture_coords(p23, face.p2, face.p3, face.t2, face.t3);
	return [
	    Face(face.img, face.p1, face.p3, p23, face.t1, face.t3, t23, face.plane),
	    Face(face.img, face.p1, face.p2, p23, face.t1, face.t2, t23, face.plane)
	];
    }
    else if(p31 !== null) {
	let t31 = texture_coords(p31, face.p3, face.p1, face.t3, face.t1);
	return [
	    Face(face.img, face.p1, face.p2, p31, face.t1, face.t2, t31, face.plane),
	    Face(face.img, face.p2, face.p3, p31, face.t2, face.t3, t31, face.plane)
	];
    }
    else return [face];
};

function Face(img, p1, p2, p3, t1, t2, t3, pln) {
    return {
	p1, p2, p3, img,
	t1, t2, t3, plane: pln || Plane(p1, p2, p3)
    };
};

// mid point on a line
function pavg(p1, p2) {
    if(p1.z !== undefined) {
	return point3d(.5 * (p1.x + p2.x), .5 * (p1.y + p2.y), .5 * (p1.z + p2.z));
    } else {
	return point2d(.5 * (p1.x + p2.x), .5 * (p1.y + p2.y));
    }
};

function dist3(p1, p2) {
    return (p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y)+(p1.z-p2.z)*(p1.z-p2.z);
};
function dist2(p1, p2) {
    return (p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y);
};



function sort3d(faces, cpos) {
    if(faces.length <= 1) return faces;
    let pvi = Math.floor(Math.random() * faces.length);
    let pivot = faces[pvi];
    let faces1 = [];
    let faces2 = [];
    let facesm = [pivot];
    let pln = pivot.plane;
    let ppvp = pln.point(cpos);
    for(let i = 0; i < faces.length; i++) {
        if(i == pvi) continue;
        if(faces[i].plane.matr.eq(pln.matr)) {
            facesm.push(faces[i]);
            continue;
        }
        let spfs = splitface(faces[i], pln);
        for(let j = 0; j < spfs.length; j++) {
            if((pln.point(spfs[j].p1) +
                pln.point(spfs[j].p2) +
               pln.point(spfs[j].p3)) * ppvp >= 0
                )/**/
                faces2.push(spfs[j]);
            else {
                faces1.push(spfs[j]);
            }
        }
    }
    return [...sort3d(faces1, cpos), ...facesm, ...sort3d(faces2, cpos)];
};


function ptexpand(midp, pt) {
    let pt2 = point2d(pt.x, pt.y);
    
    if(pt2.x < midp.x) pt2.x -= 2;
    if(pt2.x > midp.x) pt2.x += 2;
    
    if(pt2.y < midp.y) pt2.y -= 2;
    if(pt2.y > midp.y) pt2.y += 2;
    
    if(pt2.z < midp.z) pt2.z -= 2;
    if(pt2.z > midp.z) pt2.z += 2;
    
    return pt2;
};

function Draw3D(canv, ffov) {
    let ctx = canv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ffov = ffov || .5*Math.PI;
    return {
        width: canv.width,
        height: canv.height,
        pixacc: 2000,
        ctx: ctx,
        camera: Camera(canv.width, canv.height, ffov),

        lineardraw(face) {
            let p1 = this.camera.project(face.p1);
            let p2 = this.camera.project(face.p2);
            let p3 = this.camera.project(face.p3);
            try {
            let matr = interpolate(
                face.t1, face.t2, face.t3,
                p1.vec(), p2.vec(), p3.vec()
            );
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
		this.ctx.lineTo(p3.x, p3.y);
		this.ctx.closePath();
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
        
        cdraw(face) {
            let p1 = this.camera.project(face.p1);
            let p2 = this.camera.project(face.p2);
            let p3 = this.camera.project(face.p3);
            this.ctx.fillStyle = face.img;
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.lineTo(p3.x, p3.y);
	    this.ctx.closePath();
            this.ctx.fill();
        },
        
        idraw(face, p1, p2, p3) {
            p1 = p1 || this.camera.project(face.p1);
            p2 = p2 || this.camera.project(face.p2);
            p3 = p3 || this.camera.project(face.p3);
            let P = Math.abs(
            p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)
            )*.95 + .05*Math.max(dist2(p1, p2), dist2(p2, p3), dist2(p3, p1));
            
            // surface criteria satisfied
            if(P <= this.pixacc)
            this.lineardraw(face);
            else {
            let p12 = pavg(face.p1, face.p2);
            let p23 = pavg(face.p2, face.p3);
            let p31 = pavg(face.p3, face.p1);
            let t12 = pavg(face.t1, face.t2);
            let t23 = pavg(face.t2, face.t3);
            let t31 = pavg(face.t3, face.t1);
            this.idraw(Face(face.img,
                    face.p1, p12, p31,
                    face.t1, t12, t31, face.plane
                    ), p1
                );
            this.idraw(Face(face.img,
                    face.p2, p23, p12,
                    face.t2, t23, t12, face.plane
                    ), p2
                );
            this.idraw(Face(face.img,
                    face.p3, p23, p31,
                    face.t3, t23, t31, face.plane
                    ), p3
                );
            this.idraw(Face(face.img,
                    p12, p23, p31,
                    t12, t23, t31, face.plane
                    )
                );
            }
        },

        fdraw(face) {
            let faces = [face];
            let faces2 = [];
            for(let i = 0; i < this.camera.planes.length; i++) {
		let pln = this.camera.planes[i];
		let ppvp = pln.point(this.camera.vp);
		while(faces.length) {
                    let fface = faces.pop();
                    let ffaces = splitface(fface, pln);
                    for(let j = 0; j < ffaces.length; j++) {
			if((pln.point(ffaces[j].p1) + 
			    pln.point(ffaces[j].p2) +
			    pln.point(ffaces[j].p3)) * ppvp > 0
			  )
			    faces2.push(ffaces[j]);
                    }
		}
		while(faces2.length) {
                    faces.push(faces2.pop());
		}
            }
            for(let i = 0; i < faces.length; i++) {
                if(typeof faces[i].img == 'string') // color
                    this.cdraw(faces[i]);
                else
		    this.idraw(faces[i]);
            }
        },

        clear() {
            this.ctx.clearRect(0, 0, this.width, this.height);
        },
        
        drawScene(faces) {
            let faces2 = sort3d(faces, this.camera.pos);
            for(let i = 0; i < faces2.length; i++)
                this.fdraw(faces2[i]);
        }
    };
};
