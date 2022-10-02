function printmatr(mm) {
    ss = '';
    for(let i = 0; i < mm.rows; i++) {
	for(let j = 0; j < mm.cols; j++) {
	    ss += mm.data[i][j] + '\t';
	}
	ss += '\n';
    }
    console.log(ss);
}

function matrix(arg1, arg2) {
    let arr, rows, cols;
    if(typeof arg1 == 'number' && typeof arg2 == 'number') {
	arr = [];
	for(let i = 0; i < arg1; i++) {
	    arr.push([]);
	    for(let j = 0; j < arg2; j++) {
		arr[i].push(0);
	    }
	}
	rows = arg1, cols = arg2;
    }
    else if(typeof arg1 == 'object') {
	arr = arg1;
	rows = arr.length, cols = (arr[0]?arr[0].length:0);
    }
    else throw Error(`Invalid arguments to create a matrix!`);
    return {
	data: arr,
	rows: rows,
	cols: cols,
	copy() {
	    let cpy = matrix(this.rows, this.cols);
	    for(let i = 0; i < this.rows; i++) {
		for(let j = 0; j < this.cols; j++) {
		    cpy.data[i][j] = this.data[i][j];
		}
	    }
	    return cpy;
	},
	mul(matr) {
	    if(this.cols != matr.rows) throw Error('Matrices incompatible for multiplication.');
	    let resm = matrix(this.rows, matr.cols);
	    for(let i = 0; i < this.rows; i++) {
		for(let j = 0; j < matr.cols; j++) {
		    resm.data[i][j] = 0;
		    for(let k = 0; k < this.cols; k++) {
			resm.data[i][j] += this.data[i][k] * matr.data[k][j];
		    }
		}
	    }
	    return resm;
	},
	getcfactor(dest, p, q, n) {
	    let i = 0, j = 0;
	    for(let r = 0; r < n; r++) {
		for(let c = 0; c < n; c++) {
		    if(r != p && c != q) {
			dest.data[i][j++] = this.data[r][c];
			if(j == n - 1) {
			    j = 0;
			    i++;
			}
		    }
		}
	    }
	},
	det() {
	    let n = this.rows;
	    let D = 0;
	    if(n == 1) return this.data[0][0];
	    let t = matrix(n - 1, n - 1);
	    let s = 1;
	    for(let f = 0; f < n; f++) {
		this.getcfactor(t, 0, f, n);
		D += s * this.data[0][f] * t.det();
		s = -s;
	    }
	    return D;
	},
	adj() {
	    if(this.rows == 1) return matrix([[1]]);
	    let adjm = matrix(this.rows, this.cols);
	    let s = 1;
	    let t = matrix(this.rows - 1, this.cols - 1);
	    for(let i = 0; i < this.rows; i++) {
		for(let j = 0; j < this.cols; j++) {
		    this.getcfactor(t, i, j, this.rows);
		    s = ((i + j) % 2 == 0) ? 1 : -1;
		    adjm.data[j][i] = s * t.det();
		}
	    }
	    return adjm;
	},
	inv() {
	    let det = this.det(this.rows);
	    if(det == 0) throw Error('Matrix has no inverse!');
	    let adjm = this.adj();
	    for(let i = 0; i < this.rows; i++) {
		for(let j = 0; j < this.cols; j++) {
		    adjm.data[i][j] /= det;
		}
	    }
	    return adjm;
	},
    eq(m2) {
        if(this.rows != m2.rows || this.cols != m2.cols) return false;
        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                if(this.data[i][j] != m2.data[i][j]) return false;
            }
        }
        return true;
    }
    }
}
matrix.identity = function(x) {
    let mm = matrix(x, x);
    for(let i = 0; i < x; i++) mm.data[i][i] = 1;
    return mm;
}
matrix.merge_cols = function(...args) {
    let matr = matrix(args[0].rows, args.length);
    for(let i = 0; i < matr.rows; i++) {
	for(let j = 0; j < matr.cols; j++) {
	    matr.data[i][j] = args[j].data[i][0];
	}
    }
    return matr;
}
matrix.merge_rows = function(...args) {
    let mmm = [];
    for(let i = 0; i < args.length; i++) {
	mmm.push(args[i].data[0]);
    }
    return matrix(mmm);
}

/*
for(let j = 0; j < this.cols; j++) {
		//printmatr(lside);
		// current [j][j] must not be 0
		if(lside.data[j][j] == 0) {
		    found = false;
		    for(let r = 0; r < this.rows; r++) {
			if(lside.data[r][j] != 0) {
			    found = true;
			    lside.data[r] = [lside.data[j], lside.data[j] = lside.data[r]][0];
			    rside.data[r] = [rside.data[j], rside.data[j] = rside.data[r]][0];
			    break;
			}
		    }
		    if(!found) throw Error('Matrix does not have an inverse!');
		}
		// divide j-th row by value [j][j]
		let mmpl = lside.data[j][j];
		for(let i = 0; i < this.rows; i++) {
		    lside.data[j][i] /= mmpl;
		    rside.data[j][i] /= mmpl;
		}
		// substract (j-th row) x lside[i][j] from each row i =/= j
		for(let r = 0; r < this.rows; r++) {
		    if(r == j) continue;
		    let mpl = lside.data[r][j];
		    for(let c = 0; c < this.cols; c++) {
			lside.data[r][c] -= mpl * lside.data[j][c];
			rside.data[r][c] -= mpl * rside.data[j][c];
		    }
		}
	    }
	    return rside;
*/
