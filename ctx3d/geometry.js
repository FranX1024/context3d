const transform = {
    // rotation around axis (left-hand)
    rotx(alfa) {
	let s = Math.sin(alfa);
	let c = Math.cos(alfa);
	return matrix([
	    [ 1, 0, 0, 0 ],
	    [ 0, c,-s, 0 ],
	    [ 0, s, c, 0 ],
	    [ 0, 0, 0, 1 ]
	]);
    },
    roty(alfa) {
	let s = Math.sin(alfa);
	let c = Math.cos(alfa);
	return matrix([
	    [ c, 0, s, 0],
	    [ 0, 1, 0, 0],
	    [-s, 0, c, 0],
	    [ 0, 0, 0, 1]
	]);
    },
    rotz(alfa) {
	let s = Math.sin(alfa);
	let c = Math.cos(alfa);
	return matrix([
	    [ c,-s, 0, 0 ],
	    [ s, c, 0, 0 ],
	    [ 0, 0, 1, 0 ],
	    [ 0, 0, 0, 1 ]
	]);
    },
    // translation
    shift(x, y, z) {
	return matrix([
	    [ 1, 0, 0, x ],
	    [ 0, 1, 0, y ],
	    [ 0, 0, 1, z ],
	    [ 0, 0, 0, 1 ]
	]);
    }
};

function point3d(x, y, z) {
    return {
	x, y, z,
	vec() {
	    return matrix([[this.x],[this.y],[this.z],[1]]);
	}
    };
}
point3d.from = function(vec) {
    return point3d(
	vec.data[0][0],
	vec.data[1][0],
	vec.data[2][0]
    );
}

function point2d(x, y) {
    return {
	x, y,
	vec() {
	    return matrix([[this.x],[this.y],[1]]);
	}
    };
}
point2d.from = function(vec) {
    return point2d(
	vec.data[0][0],
	vec.data[1][0]
    );
}

function getangle(cos, sin) {
    if(cos == 0 && sin == 0) return 0;
    let hipo = Math.sqrt(sin*sin+cos*cos);
    sin /= hipo; cos /= hipo;
    let a = Math.acos(cos);
    if(sin < 0) a = 2 * Math.PI - a;
    return a;
}

function interpolate(p1, p2, p3, v1, v2, v3) {
    let m1 = matrix.merge_cols(p1.vec(), p2.vec(), p3.vec());
    let m2 = matrix.merge_cols(v1, v2, v3);
    return m2.mul(m1.inv());
}

// plane
function Plane(p1, p2, p3) {
    // p4 must not be on the plane
    let p4 = point3d(Math.random()*100, Math.random()*100, Math.random()*100);
    /*
                    [x1 x2 x3 x4]
      [a  b  c  d ] [y1 y2 y3 y4] = [0 0 0 1]
                    [z1 z2 z3 z4]
                    [1  1  1  1 ]
    */
    let mpts = matrix.merge_cols(p1.vec(), p2.vec(), p3.vec(), p4.vec());
    let rvec = matrix([[0, 0, 0, 1]]);
    /* if matrix has no inverse error
       occurs here, that means that the
       points provided are colinear */
    let pmatr = rvec.mul(mpts.inv());
    return {
	matr: pmatr,
	point(pt) {
	    return this.matr.mul(pt.vec()).data[0][0];
	}
    }
}
