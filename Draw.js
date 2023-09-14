function prepareElements(root) {
	var tree = levelSortTree(root[0]);
	document.body.style.width = (Math.max(...tree.map(x => x.length)) * 255 * 2) + "px";
	var container = document.getElementsByClassName("container")[0];
	var svg = document.getElementById('svg');

	for (let v of tree) {
		var br = document.createElement("br");
		for (let x of v){
			let partner = root[1].find(m => m.id == x.partner_id);
			if(partner === undefined)
				partner = new Member();

			d1 = drawChar(x.first_name + "<br>" + x.last_name,x.gender,x.id);
			d2 = drawChar(partner.first_name + "<br>" + partner.last_name,partner.gender,partner.id);

			container.appendChild(d1);
			container.appendChild(d2);
		}
		container.appendChild(br);
	}

	for(let i = 0; i < root[1].length; i++){
		if(root[1][i].parent_id != 0){
			drawPartnerLine(svg,root[1][i]);
			drawParentLine(svg,root[1][i]);	
		}
	}
}

function drawChar(name,gender,id = -100) {
	var elemDiv = document.createElement('div');
	var img = document.createElement('img');
	var text = document.createElement('span');
	var br = document.createElement('br');

	// name = "ABCD <br> XYZ"

	if(gender == "M") {
		img.src = "images/male.png";
		elemDiv.classList.add("character","male");	
	}
	else {
		img.src = "images/female.png";
		elemDiv.classList.add("character","female");	
	}

	if(id != -100)
		elemDiv.id = id;

	text.innerHTML = name;
	elemDiv.appendChild(text);
	elemDiv.appendChild(img);

	return elemDiv;
}

function drawPartnerLine(svg, character) {
	let line = document.createElementNS("http://www.w3.org/2000/svg","line");
	let xx = document.getElementById(character.id);

	line.setAttribute("x1",getOffset(xx).x + 150);
	line.setAttribute("y1",getOffset(xx).y + 100);
	line.setAttribute("x2",getOffset(xx).x + 250);
	line.setAttribute("y2",getOffset(xx).y + 100);
	line.setAttribute("stroke","red");
	line.setAttribute("stroke-width", 2);

	svg.appendChild(line);
}

function drawParentLine(svg, character) {
	if(character.parent_id == -1)
		return;

	let line = document.createElementNS("http://www.w3.org/2000/svg","line");
	let line1 = document.createElementNS("http://www.w3.org/2000/svg","line");
	let line2 = document.createElementNS("http://www.w3.org/2000/svg","line");

	let xx = document.getElementById(character.id);
	let yy = document.getElementById(character.parent_id);

	line1.setAttribute("x1",getOffset(xx).x + 200);
	line1.setAttribute("y1",getOffset(xx).y + 100);
	line1.setAttribute("x2",getOffset(xx).x + 200);
	line1.setAttribute("y2",getOffset(xx).y - 50);
	line1.setAttribute("stroke","black");
	line1.setAttribute("stroke-width", 2);

	line2.setAttribute("x1",getOffset(yy).x + 200);
	line2.setAttribute("y1",getOffset(yy).y + 100);
	line2.setAttribute("x2",getOffset(yy).x + 200);
	line2.setAttribute("y2",getOffset(yy).y + 250);
	line2.setAttribute("stroke","black");
	line2.setAttribute("stroke-width", 2);

	line.setAttribute("x1",getOffset(xx).x + 200);
	line.setAttribute("y1",getOffset(xx).y - 50);
	line.setAttribute("x2",getOffset(yy).x + 200);
	line.setAttribute("y2",getOffset(yy).y + 250);
	line.setAttribute("stroke","black");
	line.setAttribute("stroke-width", 2);

	svg.appendChild(line);
	svg.appendChild(line1);
	svg.appendChild(line2);
}

function getOffset(el) {
	const rect = el.getBoundingClientRect();
	return {
		x: rect.left + window.scrollX,
		y: rect.top + window.scrollY
	};
}

function levelSortTree(root) {
	let ans = [];
	let main_queue=[];
	let temp=[];

	main_queue.push(root);

	while (main_queue.length) {
		let n = main_queue.length;
		for (let i = 0; i < n; i++) {
			let cur = main_queue.shift();
			temp.push(cur);
			for (let u of cur.child_members)
				main_queue.push(u);
		}
		ans.push(temp);
		temp=[];
	}

	return ans;
}