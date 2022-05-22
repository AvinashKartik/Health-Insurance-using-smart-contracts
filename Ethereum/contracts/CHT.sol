// SPDX-License-Identifier: MIT

pragma solidity ^ 0.8.13;

contract CHT {
	struct Priority_Queue{
		mapping(uint => uint) costs;
		uint32 first;
		uint32 last;
	}

	struct point {
		int x;
		int y;
	}

	function dot(point memory a, point memory b) private pure returns(int) {
		return a.x * b.x + a.y * b.y;
	}

	function cross(point memory a, point memory b)  private pure returns(int) {
		return a.x * b.y - a.y * b.x;
	}

	function sub(point memory a, point memory b)  private pure returns(point memory) {
		return point(a.x - b.x, a.y - b.y);
	}

	uint private constant blocks = 40;

	point[][40] private vecs;
	point[][40] private hull;

	mapping(uint => Priority_Queue) values;

	function add_line(point memory nw, uint b) private {
		while (vecs[b].length != 0 && dot(vecs[b][uint(vecs[b].length - 1)], sub(nw, hull[b][uint(hull[b].length - 1)])) > 0) {
			hull[b].pop();
			vecs[b].pop();
		}
		if (hull[b].length != 0) {
			point memory p = sub(nw, hull[b][uint(hull[b].length - 1)]);
			vecs[b].push(point(-1 * p.y, p.x));
		}
		hull[b].push(nw);
	}

	function get(int x, uint b) private view returns(point memory) {
		if (hull[b].length == 0) return point(-1, -1);
		point memory query = point(x, 1);
		uint l = 0;
		uint r = vecs[b].length - 1;
		uint ans = vecs[b].length;
		while (l <= r) {
			uint mid = (l + r) / 2;
			if (cross(query, vecs[b][mid]) < 0) {
				ans = mid;
				r = mid - 1;
			} else {
				l = mid + 1;
			}
		}
		return hull[b][ans];
	}

	function push(uint time, uint cost) private {
		values[time].last++;
		values[time].costs[values[time].last] = cost;
	}

	function pop(uint time) private {
		require(values[time].first <= values[time].last);
		delete values[time].costs[values[time].first];
		values[time].first++;
	}

	function top(uint time) private view returns(uint) {
		return values[time].costs[values[time].first];
	}

	function ins(uint time, uint cost) public {
		uint block_no = time / blocks % blocks;
		delete vecs[block_no];
		delete hull[block_no];
		push(time, cost);
		int start = int(time - time % blocks);
		int end = start + int(blocks);
		for (int i = end - 1; i >= start; i--) {
			if (values[uint(i)].first <= values[uint(i)].last) { // pq
				point memory p = point(-2 * i, int(top(time)) + i * i);
				add_line(p, block_no);
			}
		}
	}

	function del(uint time) public {
		uint block_no = time / blocks % blocks;
		delete vecs[block_no];
		delete hull[block_no];
		pop(time);
		int start = int(time - time % blocks);
		int end = start + int(blocks);
		for (int i = end - 1; i >= start; i--) {
			if (values[uint(i)].first <= values[uint(i)].last) { // pq
				point memory p = point(-2 * i, int(top(time)) + i * i);
				add_line(p, block_no);
			}
		}
	}

	function most_priority(int time) public view returns(point memory) {
		int mx = -1e18;
		point memory claim = point(-1, -1);
		for (uint i = 0; i < blocks; i++) {
			point memory p = get(time, i);
			if (p.x == -1) continue;
			if (dot(point(time, 1), p) > mx) {
				mx = dot(point(time, 1), p);
				claim = p;
			}
		}
		return claim;
	}
}